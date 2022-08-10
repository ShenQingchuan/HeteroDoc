import { ItalicExtension } from './italic'
import { BoldExtension } from './bold'
import { CodeExtension } from './code'
import { UnderlineExtension } from './underline'
import { DeleteLineExtension } from './deleteLine'
import { HyperlinkExtension } from './hyperlink'
import { HeadingExtension } from './heading'

export const extensionsMap = {
  bold: BoldExtension,
  italic: ItalicExtension,
  code: CodeExtension,
  underline: UnderlineExtension,
  deleteLine: DeleteLineExtension,
  hyperlink: HyperlinkExtension,
  heading: HeadingExtension,
}
