import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import {
  EXTENSION_NAMES,
  HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME,
} from '../../constants'
import { ExtensionType } from '../../types'
import type { Transaction } from 'prosemirror-state'
import type { Node as ProsemirrorNode } from 'prosemirror-model'
import type { EditorCore } from '../../core'
import type {
  Command,
  IEditorExtension,
  NoArgsCommand,
  Range,
} from '../../types'

interface TextNodesWithPosition {
  text: string
  pos: number
}

const getRegex = (
  s: string,
  disableRegex: boolean,
  caseSensitive: boolean
): RegExp => {
  return new RegExp(
    disableRegex ? s.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&') : s,
    caseSensitive ? 'gu' : 'gui'
  )
}

interface ProcessedSearches {
  decorationsToReturn: DecorationSet
  results: Range[]
}

function processSearches(
  doc: ProsemirrorNode,
  searchTerm: RegExp,
  searchResultClass: string
): ProcessedSearches {
  const decorations: Decoration[] = []
  let textNodesWithPosition: TextNodesWithPosition[] = []
  const results: Range[] = []

  let index = 0

  if (!searchTerm)
    return { decorationsToReturn: DecorationSet.empty, results: [] }

  doc?.descendants((node, pos) => {
    if (node.isText) {
      const textNodeByIndex = textNodesWithPosition[index]
      if (textNodeByIndex) {
        textNodesWithPosition[index] = {
          text: textNodeByIndex.text + node.text,
          pos: textNodeByIndex.pos,
        }
      } else {
        textNodesWithPosition[index] = {
          text: `${node.text}`,
          pos,
        }
      }
    } else {
      index += 1
    }
  })

  textNodesWithPosition = textNodesWithPosition.filter(Boolean)

  for (const { text, pos } of textNodesWithPosition) {
    const matches = Array.from(text.matchAll(searchTerm)).filter(
      ([matchText]) => matchText.trim()
    )

    for (const m of matches) {
      if (m[0] === '') break

      if (m.index !== undefined) {
        results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        })
      }
    }
  }

  for (const r of results) {
    decorations.push(
      Decoration.inline(r.from, r.to, { class: searchResultClass })
    )
  }

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results,
  }
}

const replace = (replaceTerm: string, results: Range[], tr: Transaction) => {
  const firstResult = results[0]
  if (!firstResult) return

  const { from, to } = firstResult
  tr.insertText(replaceTerm, from, to)
}

const rebaseNextResult = (
  replaceTerm: string,
  index: number,
  lastOffset: number,
  results: Range[]
): [number, Range[]] | null => {
  const nextIndex = index + 1
  const resultByIndex = results[nextIndex]
  if (!resultByIndex) return null
  const { from: currentFrom, to: currentTo } = resultByIndex
  const offset = currentTo - currentFrom - replaceTerm.length + lastOffset
  const { from, to } = results[nextIndex]!

  results[nextIndex] = {
    to: to - offset,
    from: from - offset,
  }

  return [offset, results]
}

const replaceAll = (replaceTerm: string, results: Range[], tr: Transaction) => {
  let offset = 0

  let resultsCopy = results.slice()

  if (resultsCopy.length === 0) return

  for (let i = 0; i < resultsCopy.length; i += 1) {
    const resultItem = resultsCopy[i]
    if (!resultItem) continue
    const { from, to } = resultItem

    tr.insertText(replaceTerm, from, to)

    const rebaseNextResultResponse = rebaseNextResult(
      replaceTerm,
      i,
      offset,
      resultsCopy
    )

    if (!rebaseNextResultResponse) continue

    offset = rebaseNextResultResponse[0]
    resultsCopy = rebaseNextResultResponse[1]
  }
}

interface SearchAndReplaceCommandDefs {
  /**
   * @description Set search term in extension.
   */
  setSearchTerm: Command<{ searchTerm: string }>
  /**
   * @description Set replace term in extension.
   */
  setReplaceTerm: Command<{ replaceTerm: string }>
  /**
   * @description Replace first instance of search result with given replace term.
   */
  replace: NoArgsCommand
  /**
   * @description Replace all instances of search result with given replace term.
   */
  replaceAll: NoArgsCommand
  clearSearch: NoArgsCommand
}

declare module '@hetero/editor' {
  interface Commands {
    setSearchTerm: SearchAndReplaceCommandDefs['setSearchTerm']
    setReplaceTerm: SearchAndReplaceCommandDefs['setReplaceTerm']
    replace: SearchAndReplaceCommandDefs['replace']
    replaceAll: SearchAndReplaceCommandDefs['replaceAll']
    clearSearch: SearchAndReplaceCommandDefs['clearSearch']
  }
}

interface SearchAndReplaceOptions {
  caseSensitive: boolean
  disableRegex: boolean
}

interface SearchAndReplaceStorage {
  searchTerm: string
  replaceTerm: string
  results: Range[]
  lastSearchTerm: string
}

interface SearchAndReplaceStorage {
  searchTerm: string
  replaceTerm: string
  results: Range[]
  lastSearchTerm: string
}

export const searchAndReplacePluginKey = new PluginKey('searchAndReplace')

export class SearchAndReplaceExtension
  implements IEditorExtension<SearchAndReplaceOptions>
{
  type = ExtensionType.func
  name = EXTENSION_NAMES.SEARCH_AND_REPLACE
  storage: SearchAndReplaceStorage

  constructor(
    public core: EditorCore,
    public options: SearchAndReplaceOptions = {
      caseSensitive: false,
      disableRegex: false,
    }
  ) {
    this.storage = {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      lastSearchTerm: '',
    }
  }

  getProseMirrorPlugin: () => Plugin[] = () => {
    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: ({ doc, docChanged }, oldState) => {
            const { searchTerm, lastSearchTerm } = this.storage
            const { disableRegex, caseSensitive } = this.options
            const setLastSearchTerm = (term: string) => {
              this.storage.lastSearchTerm = term
            }
            if (!docChanged && lastSearchTerm === searchTerm) return oldState
            setLastSearchTerm(searchTerm)
            if (!searchTerm) return DecorationSet.empty
            const { decorationsToReturn, results } = processSearches(
              doc,
              getRegex(searchTerm, disableRegex, caseSensitive),
              HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME
            )
            this.storage.results = results
            return decorationsToReturn
          },
        },
        props: {
          handleKeyDown: (view, event) => {
            // If the user press 'Mod+F' or 'Ctrl+F' key, we will trigger the search dialog
            if (
              event.key.toLocaleLowerCase() === 'f' &&
              (event.ctrlKey || event.metaKey)
            ) {
              event.preventDefault()
              event.stopPropagation()
              this.core.emit('toggleSearchView', { state: 'on' })
              return true
            }
          },
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  }

  commands: () => SearchAndReplaceCommandDefs = () => {
    return {
      clearSearch: () => () => {
        this.storage.searchTerm = ''
        return true
      },
      setSearchTerm:
        ({ searchTerm }) =>
        () => {
          this.storage.searchTerm = searchTerm
          return true
        },
      setReplaceTerm:
        ({ replaceTerm }) =>
        () => {
          this.storage.replaceTerm = replaceTerm
          return true
        },
      replace:
        () =>
        ({ tr }) => {
          const { replaceTerm, results } = this.storage
          replace(replaceTerm, results, tr)
          return true
        },
      replaceAll:
        () =>
        ({ tr }) => {
          const { replaceTerm, results } = this.storage
          replaceAll(replaceTerm, results, tr)
          return true
        },
    }
  }
}
