import { EXTENSION_NAMES } from '../constants'
import type { NodeType } from 'prosemirror-model'

export function isListItem(typeOrName: string | NodeType): boolean {
  if (typeof typeOrName === 'string') {
    return typeOrName === EXTENSION_NAMES.LIST_ITEM
  }
  return typeOrName.name === EXTENSION_NAMES.LIST_ITEM
}
