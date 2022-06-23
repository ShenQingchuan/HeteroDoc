import { BoldExtension } from './bold'

export type ExtensionsKeys = keyof typeof extensionsMap
export const extensionsMap = {
  bold: BoldExtension,
}
