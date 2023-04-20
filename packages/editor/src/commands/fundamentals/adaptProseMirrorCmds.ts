import {
  createParagraphNear as originalCreateParagraphNear,
  deleteSelection as originalDeleteSelection,
  exitCode as originalExitCode,
  joinBackward as originalJoinBackward,
  joinForward as originalJoinForward,
  liftEmptyBlock as originalLiftEmptyBlock,
  newlineInCode as originalNewLineInCode,
  selectNodeBackward as originalSelectNodeBackward,
  selectNodeForward as originalSelectNodeForward,
  wrapIn as originalWrapIn,
} from 'prosemirror-commands'
import { getNodeType } from '../../helpers/getNodeType'
import type { NodeType } from 'prosemirror-model'
import type { Command, Commands, NoArgsCommand } from '../../types'

declare module '@hetero/editor' {
  // @eslint-ignore
  interface Commands {
    deleteSelection: NoArgsCommand
    joinBackward: NoArgsCommand
    joinForward: NoArgsCommand
    selectNodeBackward: NoArgsCommand
    selectNodeForward: NoArgsCommand
    liftEmptyBlock: NoArgsCommand
    createParagraphNear: NoArgsCommand
    newlineInCode: NoArgsCommand
    exitCode: NoArgsCommand
    wrapIn: Command<{
      typeOrName: string | NodeType
      attrs?: Record<string, any>
    }>
  }
}

export const deleteSelection: Commands['deleteSelection'] =
  () =>
  ({ state, dispatch }) => {
    return originalDeleteSelection(state, dispatch)
  }
export const joinBackward: Commands['joinBackward'] =
  () =>
  ({ state, dispatch }) => {
    return originalJoinBackward(state, dispatch)
  }
export const joinForward: Commands['joinForward'] =
  () =>
  ({ state, dispatch }) => {
    return originalJoinForward(state, dispatch)
  }
export const selectNodeBackward: Commands['selectNodeBackward'] =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeBackward(state, dispatch)
  }
export const selectNodeForward: Commands['selectNodeForward'] =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeForward(state, dispatch)
  }
export const liftEmptyBlock: Commands['liftEmptyBlock'] =
  () =>
  ({ state, dispatch }) => {
    return originalLiftEmptyBlock(state, dispatch)
  }
export const createParagraphNear: Commands['createParagraphNear'] =
  () =>
  ({ state, dispatch }) => {
    return originalCreateParagraphNear(state, dispatch)
  }
export const newlineInCode: Commands['newlineInCode'] =
  () =>
  ({ state, dispatch }) => {
    return originalNewLineInCode(state, dispatch)
  }
export const exitCode: Commands['exitCode'] =
  () =>
  ({ state, dispatch }) => {
    return originalExitCode(state, dispatch)
  }
export const wrapIn: Commands['wrapIn'] =
  ({ typeOrName, attrs = {} }) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalWrapIn(type, attrs)(state, dispatch)
  }
