import { HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import { blockIdDataAttrAtDOM } from '../utils/blockSchema'
import {
  extendsTextBlockAttrs,
  getTextBlockAttrsFromElement,
  stylesOfTextBlock,
} from '../utils/textBlockSchema'
import type { SchemaSpec } from 'prosemirror-model'

export function mergeSchemaSpecs(specs: Partial<SchemaSpec>[]): SchemaSpec {
  const merged: SchemaSpec = {
    nodes: {
      doc: { content: 'block+', topNode: true },
      paragraph: {
        group: 'block non_quote_block',
        content: 'inline*',
        attrs: extendsTextBlockAttrs(),
        parseDOM: [
          {
            tag: 'p',
            getAttrs(element) {
              return element instanceof HTMLElement
                ? getTextBlockAttrsFromElement(element)
                : null
            },
          },
        ],
        toDOM(node) {
          return [
            'p',
            {
              style: stylesOfTextBlock(node),
              [HETERO_BLOCK_NODE_DATA_TAG]: 'true',
              ...blockIdDataAttrAtDOM(node),
            },
            0,
          ]
        },
      },
      text: { group: 'inline' },
    },
    marks: {},
  }
  specs.forEach((spec) => {
    const { nodes, marks } = spec
    if (nodes) Object.assign(merged.nodes, nodes)
    else if (marks) Object.assign(merged.marks ?? {}, marks)
  })
  return merged
}
