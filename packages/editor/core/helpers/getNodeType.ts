import type { NodeType, Schema } from 'prosemirror-model'

export function getNodeType(nameOrType: string | NodeType, schema: Schema): NodeType {
  if (typeof nameOrType === 'string') {
    const nodeType = schema.nodes[nameOrType]
    if (!nodeType) {
      throw new Error(`There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`)
    }

    return nodeType
  }

  return nameOrType
}
