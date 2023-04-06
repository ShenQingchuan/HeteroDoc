import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'

import { getNodeType } from '../../core/helpers/getNodeType'
import type { Command, Commands } from '../../types'
import type { NodeType } from 'prosemirror-model'

declare module '@hetero/editor' {
  interface Commands {
    sinkListItem: Command<{
      typeOrName: string | NodeType
    }>
  }
}

export const sinkListItem: Commands['sinkListItem'] =
  ({ typeOrName }) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalSinkListItem(type)(state, dispatch)
  }
