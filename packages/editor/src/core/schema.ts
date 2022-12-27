import type { AttributeSpec, Node, SchemaSpec } from 'prosemirror-model'
import { merge, omit } from 'lodash'
import { HETERO_BLOCK_NODE_DATA_TAG } from '../constants'

export function extendsTextBlockAttrs(
  others: Record<string, AttributeSpec> = {}, excludes?: string[],
) {
  const textBlockAttrsBase: Record<string, AttributeSpec> = {
    textAlign: { default: 'left' },
    textIndent: { default: 0 },
  }
  let textBlockAttrs = merge(textBlockAttrsBase, others)
  if (excludes) {
    textBlockAttrs = omit(textBlockAttrs, ...excludes)
  }
  return textBlockAttrs
}

export function stylesOfTextBlock(
  node: Node,
  otherStyle?: string | ((node: Node) => string),
) {
  let style = ''
  if (node.attrs.textAlign) {
    style += `text-align:${node.attrs.textAlign};`
  }
  if (node.attrs.textIndent > 0) {
    style += `padding-left:${node.attrs.textIndent}em;`
  }

  if (typeof otherStyle === 'function') {
    style = style + otherStyle(node)
  }
  else {
    style += otherStyle ?? ''
  }
  return style
}

export function getTextBlockAttrsFromElement(el: HTMLElement) {
  return {
    textAlign: el.style.textAlign ?? 'left',
    textIndent: el.style.textIndent ?? 0,
  }
}

export function mergeSchemaSpecs(specs: Partial<SchemaSpec>[]): SchemaSpec {
  const merged: SchemaSpec = {
    nodes: {
      doc: { content: 'block+', topNode: true },
      paragraph: {
        group: 'block non_quote_block',
        content: 'inline*',
        attrs: extendsTextBlockAttrs(),
        parseDOM: [{
          tag: 'p',
          getAttrs(element) {
            return element instanceof HTMLElement
              ? getTextBlockAttrsFromElement(element)
              : null
          },
        }],
        toDOM(node) {
          const style = stylesOfTextBlock(node)
          return ['p', { style, [HETERO_BLOCK_NODE_DATA_TAG]: 'true' }, 0]
        },
      },
      text: { group: 'inline' },
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
