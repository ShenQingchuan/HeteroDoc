import type { MarkType } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import type { EditorState, TextSelection } from 'prosemirror-state'
import { callOrReturn } from '../utils/callOrReturn'
import { isNumber } from '../utils/isSomewhat'
import type { Range } from '../types'
import { createChainableState } from './helpers/createChainableState'
import { getTextContentFromNodes } from './helpers/getTextContentFromNodes'
import { getMarksBetween } from './helpers/getMarksBetween'
import type { EditorCore } from './index'

interface PatternRuleHandlerProps {
  state: EditorState
  range: Range
  match: RegExpMatchArray
}
interface MarkRuleConfig {
  find: RegExp
  type: MarkType
  getAttributes?:
  | Record<string, any>
  | ((match: RegExpMatchArray) => Record<string, any>)
  | false
  | null
}
const createMarkRuleHandler = (config: MarkRuleConfig) => ({ state, range, match }: PatternRuleHandlerProps) => {
  const attributes = callOrReturn(config.getAttributes, undefined, match)
  if (attributes === false || attributes === null)
    return null

  const { tr } = state
  const captureGroup = match.groups?.text
  const fullMatch = match[0]
  let markEnd = range.to

  if (fullMatch && captureGroup) {
    const startSpaces = fullMatch.search(/\S/)
    const textStart = range.from + fullMatch.indexOf(captureGroup)
    const textEnd = textStart + captureGroup.length

    const excludedMarks = getMarksBetween(range.from, range.to, state.doc)
      .filter((item) => {
        return (
          item.mark.type.excludes(config.type)
          && !item.mark.type.excludes(item.mark.type)
        )
      })
      .filter(item => item.to > textStart)

    if (excludedMarks.length)
      return null

    if (textEnd < range.to)
      tr.delete(textEnd, range.to)

    if (textStart > range.from)
      tr.delete(range.from + startSpaces, textStart)

    markEnd = range.from + startSpaces + captureGroup.length

    tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}))
    tr.removeStoredMark(config.type)
  }
}

export class PatternRule {
  find: RegExp
  handler: (props: PatternRuleHandlerProps) => void | null

  constructor(config: {
    find: RegExp
    handler: (props: PatternRuleHandlerProps) => void | null
  }) {
    this.find = config.find
    this.handler = config.handler
  }
}
const inputRuleMatcherHandler = (text: string, find: RegExp): RegExpMatchArray | null => {
  return find.exec(text)
}
function runInputRule(config: {
  core: EditorCore
  from: number
  to: number
  text: string
  rules: PatternRule[]
  plugin: Plugin
}): boolean {
  const {
    core, from, to, text,
    rules, plugin,
  } = config
  const { view } = core

  if (view.composing)
    return false

  const $from = view.state.doc.resolve(from)
  if (
    // check for code node
    $from.parent.type.spec.code
    // check for code mark
    || !!($from.nodeBefore || $from.nodeAfter)?.marks.find(mark => mark.type.spec.code)
  )
    return false

  let matched = false
  const textBefore = getTextContentFromNodes($from) + text
  rules.forEach((rule) => {
    if (matched)
      return

    const match = inputRuleMatcherHandler(textBefore, rule.find)
    if (!match)
      return

    const tr = view.state.tr
    const state = createChainableState({
      state: view.state,
      transaction: tr,
    })
    const matchFirstItem = match[0]
    const range = {
      from: from - (matchFirstItem ? (matchFirstItem.length - text.length) : 0),
      to,
    }
    const handler = rule.handler({
      state,
      range,
      match,
    })

    // stop if there are no changes
    if (handler === null || !tr.steps.length)
      return

    // store transform as meta data
    // so we can undo input rules within the `undoInputRules` command
    tr.setMeta(plugin, {
      transform: tr,
      from,
      to,
      text,
    })

    view.dispatch(tr)
    matched = true
  })

  return matched
}
/**
 * Build an input rule that adds a mark when the
 * matched text is typed into it.
 */
export function markInputRule(config: MarkRuleConfig) {
  return new PatternRule({
    find: config.find,
    handler: createMarkRuleHandler(config),
  })
}
/**
 * Create an input rules plugin. When enabled, it will cause text
 * input that matches any of the given rules to trigger the rule???s
 * action.
 */
export function inputRules(props: { core: EditorCore; rules: PatternRule[] }): Plugin {
  const { core, rules } = props
  const plugin = new Plugin({
    state: {
      init() {
        return null
      },
      apply(tr, prev) {
        const stored = tr.getMeta(plugin)
        if (stored)
          return stored

        return tr.selectionSet || tr.docChanged
          ? null
          : prev
      },
    },
    props: {
      handleTextInput(_, from, to, text) {
        return runInputRule({
          core,
          from,
          to,
          text,
          rules,
          plugin,
        })
      },

      handleDOMEvents: {
        compositionend: (view) => {
          setTimeout(() => {
            const { $cursor } = view.state.selection as TextSelection

            if ($cursor) {
              runInputRule({
                core,
                from: $cursor.pos,
                to: $cursor.pos,
                text: '',
                rules,
                plugin,
              })
            }
          })

          return false
        },
      },

      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(view, event) {
        if (event.key !== 'Enter')
          return false

        const { $cursor } = view.state.selection as TextSelection

        if ($cursor) {
          return runInputRule({
            core,
            from: $cursor.pos,
            to: $cursor.pos,
            text: '\n',
            rules,
            plugin,
          })
        }

        return false
      },
    },
    isInputRules: true,
  }) as Plugin

  return plugin
}

const pasteRuleMatcherHandler = (text: string, find: RegExp): RegExpMatchArray[] => {
  return [...text.matchAll(find)]
}
function runPasteRule(config: {
  core: EditorCore
  state: EditorState
  from: number
  to: number
  rule: PatternRule
}): boolean {
  const {
    state,
    from,
    to,
    rule,
  } = config

  const handlers: (void | null)[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isTextblock || node.type.spec.code)
      return

    const resolvedFrom = Math.max(from, pos)
    const resolvedTo = Math.min(to, pos + node.content.size)
    const textToMatch = node.textBetween(
      resolvedFrom - pos,
      resolvedTo - pos,
      undefined,
      '\uFFFC',
    )

    const matches = pasteRuleMatcherHandler(textToMatch, rule.find)

    matches.forEach((match) => {
      if (match.index === undefined)
        return

      const start = resolvedFrom + match.index + 1
      const end = start + (match[0]?.length ?? 0)
      const range = {
        from: state.tr.mapping.map(start),
        to: state.tr.mapping.map(end),
      }

      const handler = rule.handler({
        state,
        range,
        match,
      })

      handlers.push(handler)
    })
  })

  const success = handlers.every(handler => handler !== null)

  return success
}
/**
 * Build an paste rule that adds a mark when the
 * matched text is pasted into it.
 */
export function markPasteRule(config: MarkRuleConfig) {
  return new PatternRule({
    find: config.find,
    handler: createMarkRuleHandler(config),
  })
}
/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule???s
 * action.
 */
export function pasteRules(props: { core: EditorCore; rules: PatternRule[] }): Plugin[] {
  const { core, rules } = props
  let dragSourceElement: Element | null = null
  let isPastedFromProseMirror = false
  let isDroppedFromProseMirror = false

  const plugins = rules.map((rule) => {
    return new Plugin({
      // we register a global drag handler to track the current drag source element
      view(view) {
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

          paste: (_, event: Event) => {
            const html = (event as ClipboardEvent).clipboardData?.getData('text/html')
            isPastedFromProseMirror = !!html?.includes('data-pm-slice')
            return false
          },
        },
      },

      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0]
        const isPaste = transaction?.getMeta('uiEvent') === 'paste' && !isPastedFromProseMirror
        const isDrop = transaction?.getMeta('uiEvent') === 'drop' && !isDroppedFromProseMirror

        if (!isPaste && !isDrop)
          return

        // stop if there is no changed range
        const from = oldState.doc.content.findDiffStart(state.doc.content)
        const to = oldState.doc.content.findDiffEnd(state.doc.content)

        if (!isNumber(from) || !to || from === to.b)
          return

        // build a chainable state
        // so we can use a single transaction for all paste rules
        const tr = state.tr
        const chainableState = createChainableState({
          state,
          transaction: tr,
        })

        const handler = runPasteRule({
          core,
          state: chainableState,
          from: Math.max(from - 1, 0),
          to: to.b,
          rule,
        })

        // stop if there are no changes
        if (!handler || !tr.steps.length)
          return

        return tr
      },
    })
  })

  return plugins
}
