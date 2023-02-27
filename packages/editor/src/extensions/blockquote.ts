import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import type { EditorCore } from '../core'
import type { PatternRule } from '../core/rule'
import { wrappingInputRule } from '../core/rule'
import type { AddNodesSchema, IEditorExtension, NoArgsCommand } from '../types'
import { ExtensionType } from '../types'

const blockquoteInputRuleRegExp = /^[\>》]\s/

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
  name = EXTENSION_NAMES.BLOCK_QUOTE
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.BLOCK_QUOTE> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.BLOCK_QUOTE]: {
          content: 'non_quote_block+',
          group: 'block',
          defining: true,
          parseDOM: [
            { tag: 'blockquote' },
          ],
          toDOM() {
            return ['blockquote', { [HETERO_BLOCK_NODE_DATA_TAG]: 'true' }, 0]
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
