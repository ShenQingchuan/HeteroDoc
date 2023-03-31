import { omit } from '@hetero/shared'
import type { AttributeSpec, Node } from 'prosemirror-model'
import { getUUID } from './getUUID'

export function extendsBlockAttrs(
  others: Record<string, AttributeSpec> = {}, excludes?: string[],
) {
  const blockAttrsBase: Record<string, AttributeSpec> = {
    blockId: { default: null },
  }
  let blockAttrs = {
    ...blockAttrsBase,
    ...others,
  }
  if (excludes) {
    blockAttrs = omit(blockAttrs, ...excludes)
  }
  return blockAttrs
}

export function getBlockAttrsFromElement(el: HTMLElement) {
  return {
    blockId: el.dataset.blockId ?? getUUID(),
  }
}

export function createBlockIdAttr() {
  return {
    blockId: getUUID(),
  }
}

export function blockIdDataAttrAtDOM(node: Node) {
  return node.attrs.blockId
    ? {
        'data-blockId': node.attrs.blockId,
      }
    : {}
}
