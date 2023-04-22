import {
  BlockquoteExtension,
  BoldExtension,
  CodeBlockExtension,
  CodeExtension,
  CustomEmojiExtension,
  DeleteLineExtension,
  FontFancyExtension,
  HeadingExtension,
  HorizontalLine,
  HyperlinkExtension,
  ItalicExtension,
  UnderlineExtension,
  installListExtensions,
} from '@hetero/editor'
import { EditorFloatMenuAction } from '../../constants/editor'
import type { EditorCore, IEditorExtension } from '@hetero/editor'

export function composeExtensions(core: EditorCore): IEditorExtension[] {
  const editorStore = useEditorStore()

  return [
    new BoldExtension(core),
    new ItalicExtension(core),
    new UnderlineExtension(core),
    new CodeExtension(core),
    new DeleteLineExtension(core),
    new HyperlinkExtension(core, {
      onTriggerEditPopover: (pos, attrs, linkText) => {
        const { url } = attrs
        editorStore
          .setLinkEditURL(url)
          .setLinkEditText(linkText)
          .setFloatMenuPosition(pos, EditorFloatMenuAction.ByUIEvent)
          .setShowLinkEdit(true)
      },
      onCloseEditPopover: () => {
        if (editorStore.isShowLinkEdit) {
          editorStore.setShowLinkEdit(false)
        }
      },
    }),
    new HeadingExtension(core),
    new BlockquoteExtension(core),
    new CodeBlockExtension(core),
    new FontFancyExtension(core),
    new HorizontalLine(core),
    ...installListExtensions(core),
    new CustomEmojiExtension(core),
  ]
}
