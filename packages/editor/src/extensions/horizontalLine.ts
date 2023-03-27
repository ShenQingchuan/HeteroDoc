import { TextSelection } from 'prosemirror-state'
import { findParentNode } from 'prosemirror-utils'
import { EXTENSION_NAMES, HETERODOC_HORIZONTAL_LINE_CLASS_NAME } from '../constants'
import type { EditorCore } from '../core'
import { getNodeType } from '../core/helpers/getNodeType'
import { PatternRule } from '../core/rule'
import type { AddNodesSchema, IEditorExtension, NoArgsCommand } from '../types'
import { ExtensionType } from '../types'

const horizontalLineRegExp = /^---\s/

interface HorizontalCommandsDefs {
  setHorizontal: NoArgsCommand
}
declare global {
  interface Commands {
    setHorizontal: HorizontalCommandsDefs['setHorizontal']
  }
}

export class HorizontalLine implements IEditorExtension {
  type = ExtensionType.node
  name = EXTENSION_NAMES.HORIZONTAL_LINE
  options = {}

  constructor(public core: EditorCore) {}

  schemaSpec: () => AddNodesSchema<EXTENSION_NAMES.HORIZONTAL_LINE> = () => {
    return {
      nodes: {
        [EXTENSION_NAMES.HORIZONTAL_LINE]: {
          group: 'block',
          defining: true,
          parseDOM: [{ tag: 'hr' }],
          toDOM() {
            return [
              'div',
              { class: `${HETERODOC_HORIZONTAL_LINE_CLASS_NAME}` },
            ]
          },
        },
      },
    }
  }

  inputRules: () => PatternRule[] = () => {
    const nodeType = this.core.schema.nodes[EXTENSION_NAMES.HORIZONTAL_LINE]!
    return [
      new PatternRule({
        find: horizontalLineRegExp,
        handler: ({ state, match, range: { from: start, to: end } }) => {
          const { tr } = state
          if (match[0]) {
            tr.replaceWith(
              start,
              end,
              nodeType.create({},
              ),
            )
            const newStart = tr.mapping.map(start)
            tr.setSelection(
              TextSelection.create(tr.doc, newStart),
            )
          }
        },
      }),
    ]
  }

  commands: () => HorizontalCommandsDefs = () => {
    return {
      setHorizontal: () => ({ tr }) => {
        const horizontalType = getNodeType(this.name, this.core.schema)
        const closetTextBlock = findParentNode(
          node => node.isTextblock,
        )(tr.selection)
        if (!closetTextBlock) {
          return false
        }
        const { pos, node } = closetTextBlock
        tr.insert(
          pos + node.nodeSize,
          horizontalType.create(),
        )
        return true
      },
    }
  }
}
