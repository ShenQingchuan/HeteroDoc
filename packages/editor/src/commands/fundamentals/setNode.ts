import { setBlockType } from 'prosemirror-commands'
import { getNodeType } from '../../core/helpers/getNodeType'
import type { NodeType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    setNode: Command<{
      typeOrName: string | NodeType
      attrs?: Record<string, any>
    }>
  }
}

export const setNode: Commands['setNode'] =
  ({ typeOrName, attrs = {} }) =>
  ({ state, dispatch, chain }) => {
    const type = getNodeType(typeOrName, state.schema)

    if (!type.isTextblock) {
      console.warn('[Editor warn]: "setNode()" only supports text block nodes.')
      return false
    }

    return (
      chain()
        // try to convert node to default node if needed
        .command({
          fn: ({ commands }) => {
            const canSetBlock = setBlockType(type, attrs)(state)

            if (canSetBlock) {
              return true
            }

            return commands.clearNodes()
          },
        })
        .command({
          fn: ({ state: updatedState }) => {
            return setBlockType(type, attrs)(updatedState, dispatch)
          },
        })
        .run()
    )
  }
