import { InputRule } from 'prosemirror-inputrules'
import type { Mark, MarkType } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

import { callOrReturn } from '../utils/callOrReturn'

function getMarksBetween(start: number, end: number, state: EditorState) {
  let marks: { start: number; end: number; mark: Mark }[] = []
  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [
      ...marks,
      ...node.marks.map(mark => ({
        start: pos,
        end: pos + node.nodeSize,
        mark,
      })),
    ]
  })
  return marks
}

function createMarkHandler(
  markType: MarkType,
  getAttrs: any,
) {
  return (state: EditorState, match: string[], start: number, end: number) => {
    const attrs = callOrReturn(getAttrs, undefined, match)
    const { tr } = state
    const captureGroup = match[match.length - 1]
    const fullMatch = match[0]
    let markEnd = end

    if (captureGroup) {
      const startSpaces = fullMatch.search(/\S/)
      const textStart = start + fullMatch.indexOf(captureGroup)
      const textEnd = textStart + captureGroup.length

      const excludedMarks = getMarksBetween(start, end, state)
        .filter(item => item.mark.type.excludes(markType) && !item.mark.type.excludes(item.mark.type))
        .filter(item => item.end > textStart)

      if (excludedMarks.length)
        return null

      if (textEnd < end)
        tr.delete(textEnd, end)

      if (textStart > start)
        tr.delete(start + startSpaces, textStart)

      markEnd = end + startSpaces + captureGroup.length

      tr.addMark(start + startSpaces, markEnd, markType.create(attrs || {}))
        .removeStoredMark(markType)
    }

    return tr
  }
}

export function markInputRule(
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: any,
) {
  return new InputRule(
    regexp,
    createMarkHandler(markType, getAttrs),
  )
}

type RuleHandler = (state: EditorState, match: string[], start: number, end: number) => Transaction | null

export class PasteRule {
  handler: RuleHandler

  constructor(
    readonly match: RegExp,
    handler: RuleHandler,
  ) {
    this.handler = handler
    this.match = match
  }
}

export function markPasteRule(
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: any,
) {
  return new PasteRule(
    regexp,
    createMarkHandler(markType, getAttrs),
  )
}

function runPasteHandler(
  state: EditorState,
  from: number,
  to: number,
  rule: PasteRule,
): boolean {
  const handledTransactions: (Transaction | null)[] = []
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isTextblock || node.type.spec.node)
      return

    const resolvedFrom = Math.max(from, pos)
    const resolvedTo = Math.min(to, pos + node.nodeSize)
    const textToMatch = node.textBetween(
      resolvedFrom - pos,
      resolvedTo - pos,
      undefined,
      '\uFFFC',
    )

    const matches = [...textToMatch.matchAll(rule.match)]
    matches.forEach((match) => {
      if (match.index === undefined)
        return

      const resolvedStart = resolvedFrom + match.index + 1
      const resolvedEnd = resolvedStart + match[0].length
      const start = state.tr.mapping.map(resolvedStart)
      const end = state.tr.mapping.map(resolvedEnd)
      const handleResult = rule.handler(
        state,
        match,
        start,
        end,
      )
      handledTransactions.push(handleResult)
    })
  })

  return handledTransactions.some(tr => tr !== null)
}

export function pasteRules(rules: PasteRule[]): Plugin[] {
  let dragSourceElement: Element | null = null
  let isPastedFromProseMirror = false
  let isDroppedFromProseMirror = false

  return rules.map((rule) => {
    return new Plugin({
      // Register a global drag handler to track the current drag source element
      view(view: EditorView) {
        const handleDragstart = (event: DragEvent) => {
          dragSourceElement = view.dom.parentElement?.contains(event.target as Element)
            ? view.dom.parentElement
            : null
        }

        window.addEventListener('dragstart', handleDragstart)

        return {
          destroy() {
            window.removeEventListener('dragstart', handleDragstart)
          },
        }
      },
      props: {
        handleDOMEvents: {
          drop: (view) => {
            isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement
            return false
          },
          paste: (view, event) => {
            const html = (event as ClipboardEvent).clipboardData?.getData('text/html')
            isPastedFromProseMirror = !!html?.includes('data-pm-slice')
            return false
          },
        },
      },
      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0]
        const isPaste = transaction.getMeta('uiEvent') === 'paste' && !isPastedFromProseMirror
        const isDrop = transaction.getMeta('uiEvent') === 'drop' && !isDroppedFromProseMirror
        if (!isPaste && !isDrop)
          return

        // stop if there is no changed range
        const from = oldState.doc.content.findDiffStart(state.doc.content)
        const to = oldState.doc.content.findDiffEnd(state.doc.content)
        if (typeof from !== 'number' || !to || from === to.b)
          return

        const hasTransaction = runPasteHandler(
          state,
          Math.max(from - 1, 0),
          to.b,
          rule,
        )
        if (!hasTransaction || state.tr.steps.length === 0)
          return

        return state.tr
      },
    })
  })
}
