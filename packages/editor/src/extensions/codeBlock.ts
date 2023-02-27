import type { HLJSApi } from 'highlight.js'
import { highlightPlugin } from 'prosemirror-highlightjs'
import type { Plugin } from 'prosemirror-state'
import { TextSelection } from 'prosemirror-state'
import { findParentNode } from 'prosemirror-utils'
import { EXTENSION_NAMES, HETERO_BLOCK_NODE_DATA_TAG } from '../constants'
import type { EditorCore } from '../core'
import type { PatternRule } from '../core/rule'
import { textblockTypeInputRule } from '../core/rule'
import type { AddNodesSchema, Command, IEditorExtension, KeyboardShortcutCommand, NoArgsCommand } from '../types'
import { ExtensionType } from '../types'

const codeblockRegExp = /^(···|```)(?<params>[a-z]+)?[\s\n]$/

export interface CodeBlockSetterAttrs {
  params: string
  alias?: string
}
interface CodeBlockCommandsDefs {
  setCodeblock: Command<CodeBlockSetterAttrs>
  toggleCodeblock: Command<CodeBlockSetterAttrs>
  removeEmptyCodeBlock: NoArgsCommand
}

declare global {
  interface Commands {
    setCodeblock: CodeBlockCommandsDefs['setCodeblock']
    toggleCodeblock: CodeBlockCommandsDefs['toggleCodeblock']
    removeEmptyCodeBlock: CodeBlockCommandsDefs['removeEmptyCodeBlock']
  }
}

export class CodeBlockExtension implements IEditorExtension {
  type = ExtensionType.node
  name = EXTENSION_NAMES.CODE_BLOCK
  options = {}

  constructor(public core: EditorCore, public hljs: HLJSApi) {
    this.core.on('updateCodeBlock', ({ codeBlockDOM, langName, alias }) => {
      this.core.cmdManager
        .chain
        .command({
          fn: ({ view, tr }) => {
            const codeBlockPos = tr.doc.resolve(view.posAtDOM(codeBlockDOM, 0))
            const selectionMoveIntoCodeBlock = new TextSelection(codeBlockPos)
            tr.setSelection(selectionMoveIntoCodeBlock)
            view.focus()
            return true
          },
        })
        .setCodeblock({ params: langName, alias })
        .run()
    })
  }

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.CODE_BLOCK> = () => {
    const { i18nTr } = this.core
    return {
      nodes: {
        [EXTENSION_NAMES.CODE_BLOCK]: {
          content: 'text*',
          group: 'block non_quote_block',
          code: true,
          defining: true,
          marks: '',
          attrs: {
            params: { default: 'plaintext' },
            alias: { default: '' },
          },
          parseDOM: [
            {
              tag: 'pre',
              preserveWhitespace: 'full',
              getAttrs(node) {
                return {
                  params: (node as Element)?.getAttribute('data-params') || 'plaintext',
                }
              },
            },
          ],
          toDOM(node) {
            return [
              'pre',
              {
                'data-params': node.attrs.params,
                'class': 'hljs',
                [HETERO_BLOCK_NODE_DATA_TAG]: 'true',
              },
              ['div',
                {
                  'class': 'code-block-lang',
                  'data-lang-name': node.attrs.alias || (
                    node.attrs.params === 'plaintext'
                      ? i18nTr('editor.menu.code-block-lang-text-placeholder')
                      : node.attrs.params
                  ),
                },
              ],
              ['code', 0],
            ]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes[EXTENSION_NAMES.CODE_BLOCK]!
    return [
      textblockTypeInputRule(
        codeblockRegExp,
        nodeType,
        (match) => {
          return {
            params: match.groups?.params || 'plaintext',
          }
        },
      ),
    ]
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      highlightPlugin(this.hljs),
    ]
  }

  keymaps: () => Record<string, KeyboardShortcutCommand> = () => {
    return {
      Tab: (_, state, dispatch) => {
        const { $head } = state.selection
        if (!$head.parent.type.spec.code) {
          return false
        }
        if (dispatch) {
          dispatch(state.tr.insertText(new Array(2).fill(' ').join('')).scrollIntoView())
        }

        return true
      },
    }
  }

  commands: () => CodeBlockCommandsDefs = () => {
    return {
      setCodeblock: ({ params }) => ({ commands }) => {
        return commands.setNode({
          typeOrName: EXTENSION_NAMES.CODE_BLOCK,
          attrs: { params },
        })
      },
      toggleCodeblock: ({ params }) => ({ commands }) => {
        return commands.toggleNode({
          turnOn: EXTENSION_NAMES.CODE_BLOCK,
          turnOff: EXTENSION_NAMES.PARAGRAPH,
          attrs: { params },
        })
      },
      removeEmptyCodeBlock: () => ({ commands }) => {
        return commands.command({
          fn: ({ tr }) => {
            const { selection } = tr
            const foundCodeBlock = findParentNode(node => node.type.name === 'code_block')(selection)
            if (!foundCodeBlock)
              return false

            const { textContent } = foundCodeBlock.node
            if (!textContent) {
              // Empty code block
              tr.delete(
                foundCodeBlock.pos,
                foundCodeBlock.pos + foundCodeBlock.node.nodeSize,
              )
              return true
            }

            return false
          },
        })
      },
    }
  }
}
