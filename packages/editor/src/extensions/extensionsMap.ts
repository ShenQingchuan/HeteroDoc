import { ItalicExtension } from './basics/italic'
import { BoldExtension } from './basics/bold'
import { CodeExtension } from './basics/code'
import { UnderlineExtension } from './basics/underline'
import { DeleteLineExtension } from './basics/deleteLine'
import { HyperlinkExtension } from './hyperlink'
import { HeadingExtension } from './heading'
import { BlockquoteExtension } from './blockquote'
import { FontFancyExtension } from './fontFancy'

export const extensionsMap = {
  bold: BoldExtension,
  italic: ItalicExtension,
  code: CodeExtension,
  underline: UnderlineExtension,
  deleteLine: DeleteLineExtension,
  hyperlink: HyperlinkExtension,
  heading: HeadingExtension,
  blockquote: BlockquoteExtension,
  fontColor: FontFancyExtension,
}
