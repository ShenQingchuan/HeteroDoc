import { findParentNode } from 'prosemirror-utils'
import { EXTENSION_NAMES } from '../../constants'
import { ExtensionType } from '../../types'
import type { EditorCore } from '../../core'
import type {
  Command,
  IEditorExtension,
  KeyboardShortcutCommand,
  NoArgsCommand,
} from '../../types'

interface TextIdentCommandDefs {
  setTextIdent: Command<{ indent: number }>
  unsetTextIdent: NoArgsCommand
}

declare module '@hetero/editor' {
  interface Commands {
    setTextIdent: TextIdentCommandDefs['setTextIdent']
    unsetTextIdent: TextIdentCommandDefs['unsetTextIdent']
  }
}

export class TextIdent implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.TEXT_IDENT
  options = {}

  constructor(public core: EditorCore) {}

  commands: () => TextIdentCommandDefs = () => {
    const allTextBlockNodeNames = Object.values(this.core.schema.nodes)
      .filter((nodeType) => nodeType.isTextblock)
      .map((nodeType) => nodeType.name)

    return {
      setTextIdent:
        ({ indent }) =>
        ({ commands }) => {
          return allTextBlockNodeNames.every((nodeName) =>
            commands.updateAttributes({
              typeOrName: nodeName,
              attrs: {
                textIndent: indent,
              },
            })
          )
        },
      unsetTextIdent:
        () =>
        ({ commands }) => {
          return allTextBlockNodeNames.every((nodeName) =>
            commands.resetAttributes({
              typeOrName: nodeName,
              attrs: 'textIndent',
            })
          )
        },
    }
  }

  keymaps: () => Record<string, KeyboardShortcutCommand> = () => {
    const changeIndent = (
      type: 'increase' | 'decrease'
    ): KeyboardShortcutCommand => {
      return ({ commands }) => {
        const foundParentTxtBlock = findParentNode((node) => node.isTextblock)(
          this.core.view.state.selection
        )
        if (!foundParentTxtBlock) return false
        const { textIndent } = foundParentTxtBlock.node.attrs
        if (textIndent === undefined) {
          return commands.setTextIdent({ indent: 0 })
        }
        if (type === 'increase') {
          return commands.setTextIdent({ indent: textIndent + 1 })
        } else {
          if (textIndent === 0) return false
          return commands.setTextIdent({ indent: textIndent - 1 })
        }
      }
    }

    return {
      'Mod-[': changeIndent('decrease'),
      'Mod-]': changeIndent('increase'),
    }
  }
}
