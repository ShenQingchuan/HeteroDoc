import { getNodeType } from './getNodeType'
import type { NodeType } from 'prosemirror-model'
import type { EditorCore } from '../core'

export function isList(name: string | NodeType, context: EditorCore): boolean {
  const nodeType = getNodeType(name, context.schema)
  if (!nodeType) {
    return false
  }
  const group = nodeType.spec.group
  if (typeof group !== 'string') {
    return false
  }
  return group.split(' ').includes('list')
}
