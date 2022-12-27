import type { HLJSApi } from 'highlight.js'
import { highlightPlugin } from 'prosemirror-highlightjs'
import type { Plugin } from 'prosemirror-state'
import { TextSelection } from 'prosemirror-state'
import type { EditorCore } from '../core'
import type { PatternRule } from '../core/rule'
import { textblockTypeInputRule } from '../core/rule'
import type { AddNodesSchema, Command, KeyboardShortcutCommand } from '../types'
import type { IEditorExtension } from './editorExtension'
import { ExtensionType } from './editorExtension'

const codeblockRegExp = /^(···|```)(?<params>[a-z]+)?[\s\n]$/

export interface CodeBlockSetterAttrs {
  params: string
  alias?: string
}
interface CodeBlockCommandsDefs {
  setCodeblock: Command<CodeBlockSetterAttrs>
  toggleCodeblock: Command<CodeBlockSetterAttrs>
}

declare global {
  interface Commands {
    setCodeblock: CodeBlockCommandsDefs['setCodeblock']
    toggleCodeblock: CodeBlockCommandsDefs['toggleCodeblock']
  }
}

export class CodeBlockExtension implements IEditorExtension {
  type = ExtensionType.node
  name = 'codeBlock'
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

  schemaSpec: () => AddNodesSchema<'code_block'> = () => {
    const { i18nTr } = this.core
    return {
      nodes: {
        code_block: {
          content: 'text*',
          group: 'block',
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
    const nodeType = this.core.schema.nodes.code_block!
    return [
      textblockTypeInputRule(
        codeblockRegExp,
        nodeType,
        (match) => {
          return {
            params: match.groups?.params || '',
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
          typeOrName: 'code_block',
          attrs: { params },
        })
      },
      toggleCodeblock: ({ params }) => ({ commands }) => {
        return commands.toggleNode({
          turnOn: 'code_block',
          turnOff: 'paragraph',
          attrs: { params },
        })
      },
    }
  }
}
