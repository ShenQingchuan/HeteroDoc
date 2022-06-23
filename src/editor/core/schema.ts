import type { SchemaSpec } from 'prosemirror-model'

export function mergeSchemaSpecs(specs: Partial<SchemaSpec>[]): SchemaSpec {
  const merged: SchemaSpec = {
    nodes: {
      doc: { content: 'block+' },
      text: { group: 'inline' },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() { return ['p', 0] },
      },
    },
    marks: {},
  }
  specs.forEach((spec) => {
    const { nodes, marks } = spec
    if (nodes)
      Object.assign(merged.nodes, nodes)
    else if (marks)
      Object.assign(merged.marks ?? {}, marks)
  })
  return merged
}
