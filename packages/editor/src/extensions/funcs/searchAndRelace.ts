import { Plugin } from 'prosemirror-state'
import {
  EXTENSION_NAMES,
  HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME,
} from '../../constants'
import { getMarkType } from '../../core/helpers/getMarkType'
import { ExtensionType } from '../../types'
import type { EditorCore } from '../../core'
import type { AddMarksSchema, IEditorExtension } from '../../types'
import type { DOMOutputSpec } from 'prosemirror-model'

const searchAndReplaceTagDOM: DOMOutputSpec = [
  'span',
  { class: HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME },
  0,
]

export class SearchAndReplaceExtension implements IEditorExtension {
  type = ExtensionType.func
  name = EXTENSION_NAMES.SEARCH_AND_REPLACE
  options = {}

  schemaSpec: () => AddMarksSchema<EXTENSION_NAMES.SEARCH_AND_REPLACE> = () => {
    return {
      marks: {
        [EXTENSION_NAMES.SEARCH_AND_REPLACE]: {
          toDOM: () => searchAndReplaceTagDOM,
        },
      },
    }
  }

  constructor(public core: EditorCore) {
    core.on(
      'search',
      ({ pattern /* caseSensitive = false, isRegExp = false */ }) => {
        const matchedTextRanges = new Array<[number, number]>()
        const tr = core.view.state.tr
        tr.doc.descendants((node, pos) => {
          if (!node.isText || !node.text) {
            return
          }

          const textContent = node.text
          const foundTextIndex = textContent?.indexOf(pattern)
          if (foundTextIndex === -1) {
            return
          }

          const start = pos + foundTextIndex
          const end = start + pattern.length
          matchedTextRanges.push([start, end])
        })

        const searchAndReplaceMarkType = getMarkType(this.name, core.schema)
        matchedTextRanges.forEach(([start, end]) => {
          tr.addMark(start, end, searchAndReplaceMarkType.create())
        })

        tr.setMeta('searchAndReplace', true)
        core.view.dispatch(tr)
      }
    )
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            // If the user press 'Mod+F' or 'Ctrl+F' key, we will trigger the search dialog
            if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              this.core.emit('toggleSearchView', { state: 'on' })
              return true
            }
          },
        },
      }),
    ]
  }
}
