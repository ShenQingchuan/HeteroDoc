import type { Transaction } from 'prosemirror-state'
import { builtinsCommands } from '../commands/builtins'
import type { CommandProps, PrimitiveCommandsMap, RunCommandsChain } from '../types'
import { createChainableState } from './helpers/createChainableState'
import type { EditorCore } from './index'

export class CommandManager {
  private core: EditorCore
  private rawCommands: Commands

  constructor(core: EditorCore) {
    this.core = core
    this.rawCommands = {
      ...builtinsCommands,
      ...(this.core.extensions.reduce((cmds, extension) => {
        return {
          ...cmds,
          ...extension.commands?.() ?? {},
        }
      }, {}) as Omit<Commands, keyof typeof builtinsCommands>),
    }
  }

  private buildCommandProps = (tr: Transaction, shouldDispatch = true): CommandProps => {
    const { core, rawCommands } = this
    const { view } = core
    const { state } = view
    const props = {
      core,
      tr,
      view,
      state: createChainableState({ state, transaction: tr }),
      dispatch: shouldDispatch
        ? () => undefined // Just a placeholder for behaving like a runnable command
        : undefined,
      get commands() {
        return Object.fromEntries(
          Object.entries(rawCommands).map(([name, command]) => {
            return [name, (...args: never[]) => command(...args)(props)]
          }),
        ) as PrimitiveCommandsMap
      },
    }

    return props
  }

  private createChain = (shouldDispatch = true, startTr?: Transaction) => {
    const { view } = this.core
    const { state } = view
    const tr = startTr ?? state.tr
    const callbacks: boolean[] = []
    const cmdProps = this.buildCommandProps(tr, shouldDispatch)
    const chain = {
      ...Object.fromEntries(
        Object.entries(this.rawCommands).map(([name, command]) => {
          return [
            name,
            (...args: Parameters<typeof command>) => {
              const callback = command(...args)(cmdProps)
              callbacks.push(callback)
              return chain
            },
          ]
        }),
      ),
      run: () => {
        if (shouldDispatch && !tr.getMeta('preventDispatch'))
          view.dispatch(tr)

        return callbacks.every(callback => callback === true)
      },
    } as RunCommandsChain

    return chain
  }

  private createCan = (startTr?: Transaction) => {
    const dispatch = undefined
    const {
      core: { view: { state } },
      rawCommands,
    } = this
    const tr = startTr ?? state.tr
    const props = this.buildCommandProps(tr, dispatch)
    const primitiveCommands = Object.fromEntries(Object
      .entries(rawCommands)
      .map(([name, command]) => {
        return [
          name,
          (...args: never[]) => command(...args)({ ...props, dispatch }),
        ]
      })) as PrimitiveCommandsMap

    return {
      ...primitiveCommands,
      chain: () => this.createChain(dispatch, tr),
    }
  }

  public get chain() {
    return this.createChain()
  }

  public get can() {
    return this.createCan()
  }

  public getSingleCommands() {
    const { rawCommands, core } = this
    const { view } = core
    const { tr } = view.state
    const props = this.buildCommandProps(tr)

    return Object.fromEntries(
      Object.entries(rawCommands)
        .map(([name, command]) => {
          const method = (...args: any[]) => {
            const callback = command(...args)(props)
            if (!tr.getMeta('preventDispatch'))
              view.dispatch(tr)

            return callback
          }

          return [name, method]
        }),
    ) as PrimitiveCommandsMap
  }
}
