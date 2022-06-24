import { ItalicExtension } from './startkit/italic'
import { BoldExtension } from './startkit/bold'

export type ExtensionsKeys = keyof typeof extensionsMap
export const extensionsMap = {
  bold: BoldExtension,
  italic: ItalicExtension,
}
