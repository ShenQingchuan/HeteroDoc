import type {
  BlockquoteExtension,
  BoldExtension,
  CodeBlockExtension,
  CodeExtension,
  DeleteLineExtension,
  FontFancyExtension,
  HeadingExtension,
  HorizontalLine,
  HyperlinkExtension,
  ItalicExtension,
  SearchAndReplaceExtension,
  TextAlign,
  TextIdent,
  UnderlineExtension,
} from './extensions'
import type { EXTENSION_NAMES } from './constants'
import type {
  Mark as ProseMirrorMark,
  Node as ProseMirrorNode,
  SchemaSpec,
} from 'prosemirror-model'
import type {
  EditorState,
  Plugin as ProseMirrorPlugin,
  Transaction,
} from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { EditorCore } from './core'
import type { PatternRule } from './core/rule'
import type { DragAndDrop } from './extensions/funcs/dragAndDrop'
import type { Blockify } from './extensions/funcs/blockify'
import type { BaseKeymap } from './extensions/funcs/baseKeymap'

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Commands {}

export enum ExtensionType {
  func,
  node,
  mark,
}

export interface IEditorExtension<OptionsDefs = {}> {
  core: EditorCore
  type: ExtensionType
  name: EXTENSION_NAMES
  options: OptionsDefs

  schemaSpec?: () => Partial<SchemaSpec>
  inputRules?: () => PatternRule[]
  pasteRules?: () => PatternRule[]
  attributes?: () => Record<string, Attribute>
  commands?: () => Record<string, any>
  keymaps?: () => Record<string, KeyboardShortcutCommand>
  getProseMirrorPlugin?: () => ProseMirrorPlugin[]

  // hooks
  beforeTransaction?: () => void
  afterApplyTransaction?: () => void
  onSelectionChange?: (ctx: { tr: Transaction }) => void
}

export interface IEditorMark extends IEditorExtension {
  keepOnSplit?: boolean
}

export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T

export type AddNodesSchema<NodeNames extends string> = Partial<
  SchemaSpec<NodeNames, any>
>
export type AddMarksSchema<MarkNames extends string> = Partial<
  SchemaSpec<any, MarkNames>
>

export type Command<T = {}> = (args: T) => CommandPrimitive
export type OptionalArgsCommand<T = {}> = (args?: T) => CommandPrimitive
export type NoArgsCommand = () => CommandPrimitive
export type CommandPrimitive = (props: CommandProps) => boolean
export type KeyboardShortcutCommand = (
  core: EditorCore,
  // original params from 'Command'
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => boolean

type _inferCommandsArgsForExec<K extends keyof Commands> = {
  [N in K]: Commands[N] extends OptionalArgsCommand<infer A1>
    ? (arg?: A1) => boolean
    : Commands[N] extends NoArgsCommand
    ? () => boolean
    : Commands[N] extends Command<infer A>
    ? (args: A) => boolean
    : never
}
export type PrimitiveCommandsMap = _inferCommandsArgsForExec<keyof Commands>

type _inferCommandsArgsForChain<K extends keyof Commands> = {
  [N in K]: Commands[N] extends OptionalArgsCommand<infer A1>
    ? (arg?: A1) => RunCommandsChain
    : Commands[N] extends NoArgsCommand
    ? () => RunCommandsChain
    : Commands[N] extends Command<infer A>
    ? (args: A) => RunCommandsChain
    : never
}
export type RunCommandsChain = _inferCommandsArgsForChain<keyof Commands> & {
  run: () => boolean
}

export interface CommandProps {
  core: EditorCore
  tr: Transaction
  state: EditorState
  view: EditorView
  commands: PrimitiveCommandsMap
  dispatch?: (tr: Transaction) => void
  chain: () => RunCommandsChain
}
export interface ExtensionAttribute {
  extName: string
  name: string
  attr: Attribute
}
export interface Attribute {
  default: any
  rendered?: boolean
  renderHTML?:
    | ((attributes: Record<string, any>) => Record<string, any> | null)
    | null
  parseHTML?: ((element: HTMLElement) => any | null) | null
  keepOnSplit: boolean
  isRequired?: boolean
}

export interface Range {
  from: number
  to: number
}
export interface NodeRange {
  node: ProseMirrorNode
  from: number
  to: number
}
export interface MarkRange {
  mark: ProseMirrorMark
  from: number
  to: number
}

export type FocusPosition = 'start' | 'end' | 'all' | number | boolean | null

export interface InputFastpathOptions {
  blockQuoteAvailable: boolean
}

export interface FontFancyAttrs {
  colorIndex: number
  bgColorIndex: number
}

export type EditorThemeMode = 'light' | 'dark'

export interface EditorExtensionMap {
  blockquote: BlockquoteExtension
  codeBlock: CodeBlockExtension
  fontFancy: FontFancyExtension
  heading: HeadingExtension
  hyperlink: HyperlinkExtension
  textAlign: TextAlign
  textIdent: TextIdent
  dragAndDrop: DragAndDrop
  blockify: Blockify
  baseKeymap: BaseKeymap
  bold: BoldExtension
  code: CodeExtension
  deleteLine: DeleteLineExtension
  italic: ItalicExtension
  underline: UnderlineExtension
  horizontalLine: HorizontalLine
  searchAndReplace: SearchAndReplaceExtension
}
