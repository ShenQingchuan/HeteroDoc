import type { SchemaSpec } from 'prosemirror-model'

export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T

export type AddNodesSchema<NodeNames extends string> = Partial<SchemaSpec<NodeNames, any>>
export type AddMarksSchema<MarkNames extends string> = Partial<SchemaSpec<any, MarkNames>>
