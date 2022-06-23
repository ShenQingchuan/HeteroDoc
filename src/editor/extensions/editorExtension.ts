import type { InputRule } from 'prosemirror-inputrules'
import type { SchemaSpec } from 'prosemirror-model'
import type { Plugin as ProseMirrorPlugin } from 'prosemirror-state'
import type { EditorCore } from './../core/index'
import type { PasteRule } from './../core/rule'

export interface IEditorExtension<OptionsDefs = {}> {
  name: string
  options: OptionsDefs
  core: EditorCore

  schemaSpec: () => Partial<SchemaSpec>
  inputRules?: () => InputRule[]
  pasteRules?: () => PasteRule[]
  getProseMirrorPlugin?: () => ProseMirrorPlugin[]
}
