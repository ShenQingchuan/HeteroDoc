import { merge, omit } from 'lodash'
import type { AttributeSpec, Node } from 'prosemirror-model'

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
