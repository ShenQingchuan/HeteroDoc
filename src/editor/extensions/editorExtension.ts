import type { InputRule } from 'prosemirror-inputrules'
import type { Schema, SchemaSpec } from 'prosemirror-model'
import type { Plugin as ProseMirrorPlugin } from 'prosemirror-state'
import type { PasteRule } from './../core/rule'

export interface IEditorExtension<OptionsDefs = {}> {
  name: string
  options: OptionsDefs
  schema: Schema

  schemaSpec: () => Partial<SchemaSpec>
  inputRules?: () => InputRule[]
  pasteRules?: () => PasteRule[]
  getProseMirrorPlugin?: () => ProseMirrorPlugin[]
}
