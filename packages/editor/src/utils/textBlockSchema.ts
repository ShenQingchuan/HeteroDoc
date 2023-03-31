import { omit } from '@hetero/shared'
import type { AttributeSpec, Node } from 'prosemirror-model'
import { extendsBlockAttrs, getBlockAttrsFromElement } from './blockSchema'

export function extendsTextBlockAttrs(
  others: Record<string, AttributeSpec> = {}, excludes?: string[],
) {
  const textBlockAttrsBase: Record<string, AttributeSpec> = {
    textAlign: { default: 'left' },
    textIndent: { default: 0 },
    ...extendsBlockAttrs(others, excludes),
  }
  let textBlockAttrs = {
    ...textBlockAttrsBase,
    ...others,
  }
  if (excludes) {
    textBlockAttrs = omit(textBlockAttrs, ...excludes)
  }
  return textBlockAttrs
}

export function getTextBlockAttrsFromElement(el: HTMLElement) {
  return {
    textAlign: el.style.textAlign ?? 'left',
    textIndent: el.style.textIndent ?? 0,
    ...getBlockAttrsFromElement(el),
  }
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
