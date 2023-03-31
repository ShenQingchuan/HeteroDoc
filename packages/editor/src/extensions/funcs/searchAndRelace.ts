import type { DOMOutputSpec } from 'prosemirror-model'
import { EXTENSION_NAMES, HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME } from '../../constants'
import type { EditorCore } from '../../core'
import { getMarkType } from '../../core/helpers/getMarkType'
import type { AddMarksSchema, IEditorExtension } from '../../types'
import { ExtensionType } from '../../types'

const searchAndReplaceTagDOM: DOMOutputSpec = ['span', { class: HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME }, 0]

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
    core.on('search', ({ pattern /* caseSensitive = false, isRegExp = false */ }) => {
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
    })
  }
}
