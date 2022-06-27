import type { SchemaSpec } from 'prosemirror-model'
import type { Plugin as ProseMirrorPlugin } from 'prosemirror-state'
import type { EditorCore } from '../core/index'
import type { PatternRule } from '../core/rule'
import type { Attribute, Command } from '../types'

export enum ExtensionType { node, mark }

export interface IEditorExtension<OptionsDefs = {}> {
  type: ExtensionType
  name: string
  options: OptionsDefs
  core: EditorCore

  schemaSpec: () => Partial<SchemaSpec>
  inputRules?: () => PatternRule[]
  pasteRules?: () => PatternRule[]
  attributes?: () => Record<string, Attribute>
  commands?: () => Record<string, Command>
  getProseMirrorPlugin?: () => ProseMirrorPlugin[]
}

export interface IEditorMark extends IEditorExtension {
  keepOnSplit?: boolean
}
