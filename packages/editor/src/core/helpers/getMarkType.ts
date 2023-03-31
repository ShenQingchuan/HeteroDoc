import type { MarkType, Schema } from 'prosemirror-model'

export function getMarkType(
  nameOrType: string | MarkType,
  schema: Schema
): MarkType {
  if (typeof nameOrType === 'string') {
    const result = schema.marks[nameOrType]
    if (!result)
      throw new Error(
        `There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`
      )

    return result
  }

  return nameOrType
}
