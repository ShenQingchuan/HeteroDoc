import { wrapInList as originalWrapInList } from 'prosemirror-schema-list'

import { getNodeType } from '../../core/helpers/getNodeType'
import type { NodeType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    wrapInList: Command<{
      typeOrName: string | NodeType
      attributes?: Record<string, any>
    }>
  }
}

export const wrapInList: Commands['wrapInList'] =
  ({ typeOrName, attributes = {} }) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalWrapInList(type, attributes)(state, dispatch)
  }
