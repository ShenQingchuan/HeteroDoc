import type {
  Mark as ProseMirrorMark,
  Node as ProseMirrorNode,
} from 'prosemirror-model'

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
