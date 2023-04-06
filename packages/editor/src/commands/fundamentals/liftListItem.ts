import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'

import { getNodeType } from '../../core/helpers/getNodeType'
import type { Command, Commands } from '../../types'
import type { NodeType } from 'prosemirror-model'

declare module '@hetero/editor' {
  interface Commands {
    liftListItem: Command<{
      typeOrName: string | NodeType
    }>
  }
}

export const liftListItem: Commands['liftListItem'] =
  ({ typeOrName }) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalLiftListItem(type)(state, dispatch)
  }
