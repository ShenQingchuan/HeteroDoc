import type { ExtensionAttribute } from '../../types'

export function getSplittedAttributes(
  extensionAttributes: ExtensionAttribute[],
  extName: string,
  attributes: Record<string, any>
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => {
      const extensionAttribute = extensionAttributes.find((item) => {
        return item.extName === extName && item.name === name
      })

      if (!extensionAttribute) return false

      return extensionAttribute.attr.keepOnSplit
    })
  )
}
