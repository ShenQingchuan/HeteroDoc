import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import { textblockTypeInputRule } from '../core/rule'
import { ExtensionType } from '../types'
import {
  blockIdDataAttrAtDOM,
  createBlockMetaAttr,
  extendsBlockAttrs,
  getBlockAttrsFromElement,
} from '../utils/blockSchema'
import type { EditorCore } from '../core'
import type { PatternRule } from '../core/rule'
import type { AddNodesSchema, IEditorExtension, NoArgsCommand } from '../types'

const blockquoteInputRuleRegExp = /^[>》]\s/

interface BlockquoteCommandsDefs {
  setBlockquote: NoArgsCommand
}

declare module '@hetero/editor' {
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
          content: 'inline*',
          attrs: {
            ...extendsBlockAttrs(),
          },
          group: 'block',
          defining: true,
          parseDOM: [
            {
              tag: 'blockquote',
              getAttrs: (el) => {
                return el instanceof HTMLElement
                  ? {
                      ...getBlockAttrsFromElement(el),
                    }
                  : {}
              },
            },
          ],
          toDOM(node) {
            return [
              'blockquote',
              {
                [HETERO_BLOCK_NODE_DATA_TAG]: EXTENSION_NAMES.BLOCK_QUOTE,
                ...blockIdDataAttrAtDOM(node),
              },
              0,
            ]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes[EXTENSION_NAMES.BLOCK_QUOTE]!
    return [
      textblockTypeInputRule(blockquoteInputRuleRegExp, nodeType, {
        ...createBlockMetaAttr(),
      }),
    ]
  }

  commands: () => BlockquoteCommandsDefs = () => {
    return {
      setBlockquote:
        () =>
        ({ commands }) => {
          return commands.setNode({ typeOrName: this.name })
        },
    }
  }
}
