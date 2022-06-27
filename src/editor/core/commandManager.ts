import type { Transaction } from 'prosemirror-state'
import { builtinsCommands } from '../commands/builtins'
import type { CommandFilledProps, CommandProps } from '../types'
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
    const { core } = this
    const { view } = core
    const { state } = view
    return {
      core,
      tr,
      view,
      state: createChainableState({ state, transaction: tr }),
      dispatch: shouldDispatch
        ? () => undefined // Just a placeholder for behaving like a runnable command
        : undefined,
    }
  }

  get commands() {
    const { view } = this.core
    const { tr } = view.state
    const cmdProps = this.buildCommandProps(tr)

    return Object.fromEntries(
      Object.entries(this.rawCommands).map(([name, command]) => {
        const method = (...args: Parameters<typeof command>) => {
          const callback = command(...args)(cmdProps)
          if (!tr.getMeta('preventDispatch'))
            view.dispatch(tr)

          return callback
        }

        return [name, method]
      }),
    ) as CommandFilledProps
  }
}
