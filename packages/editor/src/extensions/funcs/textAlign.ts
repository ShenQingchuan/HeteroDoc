import type { EditorCore } from '../../core'
import type { Command, NoArgsCommand } from '../../types'
import type { IEditorExtension } from '../editorExtension'
import { ExtensionType } from '../editorExtension'

interface TextAlignCommandDefs {
  setTextAlign: Command<{ alignment: 'left' | 'center' | 'right' | 'justify' }>
  unsetTextAlign: NoArgsCommand
}

declare global {
  interface Commands {
    setTextAlign: TextAlignCommandDefs['setTextAlign']
    unsetTextAlign: TextAlignCommandDefs['unsetTextAlign']
  }
}

export class TextAlign implements IEditorExtension {
  type = ExtensionType.func
  name = 'textAlign'
  options = {}

  constructor(public core: EditorCore) {}

  commands: () => TextAlignCommandDefs = () => {
    const allTextBlockNodeNames
      = Object.values(this.core.schema.nodes)
        .filter(nodeType => nodeType.isTextblock)
        .map(nodeType => nodeType.name)

    return {
      setTextAlign: ({ alignment }) => ({ commands }) => {
        return allTextBlockNodeNames.every(nodeName => commands.updateAttributes({
          typeOrName: nodeName,
          attrs: {
            textAlign: alignment,
          },
        }))
      },
      unsetTextAlign: () => ({ commands }) => {
        return allTextBlockNodeNames.every(nodeName => commands.resetAttributes({
          typeOrName: nodeName,
          attrs: 'textAlign',
        }))
      },
    }
  }
}
