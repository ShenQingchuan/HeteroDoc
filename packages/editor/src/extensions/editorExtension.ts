import type { SchemaSpec } from 'prosemirror-model'
import type { Plugin as ProseMirrorPlugin } from 'prosemirror-state'
import type { EditorCore } from '../core/index'
import type { PatternRule } from '../core/rule'
import type { Attribute, KeyboardShortcutCommand } from '../types'

export enum ExtensionType { func, node, mark }

export interface IEditorExtension<OptionsDefs = {}> {
  core: EditorCore
  type: ExtensionType
  name: string
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
}

export interface IEditorMark extends IEditorExtension {
  keepOnSplit?: boolean
}
