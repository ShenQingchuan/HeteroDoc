import type { EditorCore } from '../core'
import type { PatternRule } from '../core/rule'
import { wrappingInputRule } from '../core/rule'
import type { AddNodesSchema, NoArgsCommand } from '../types'
import type { IEditorExtension } from './editorExtension'
import { ExtensionType } from './editorExtension'

const blockquoteInputRuleRegExp = /^\>\s/

interface BlockquoteCommandsDefs {
  setBlockquote: NoArgsCommand
}

declare global {
  interface Commands {
    setBlockquote: BlockquoteCommandsDefs['setBlockquote']
  }
}

export class BlockquoteExtension implements IEditorExtension {
  type = ExtensionType.node
  name = 'blockquote'
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<'blockquote'> = () => {
    return {
      nodes: {
        blockquote: {
          content: 'block+',
          group: 'block',
          defining: true,
          parseDOM: [
            { tag: 'blockquote' },
          ],
          toDOM() {
            return ['blockquote', 0]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes.blockquote!
    return [
      wrappingInputRule({
        find: blockquoteInputRuleRegExp,
        type: nodeType,
      }),
    ]
  }

  commands: () => BlockquoteCommandsDefs = () => {
    return {
      setBlockquote: () => ({ commands }) => {
        return commands.wrapIn({ typeOrName: this.name })
      },
    }
  }
}
