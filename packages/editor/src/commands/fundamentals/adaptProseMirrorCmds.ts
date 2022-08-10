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
} from 'prosemirror-commands'
import type { NoArgsCommand } from '../../types'

declare global {
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
  }
}

export const deleteSelection: Commands['deleteSelection'] = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
export const joinBackward: Commands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}
export const joinForward: Commands['joinForward'] = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}
export const selectNodeBackward: Commands['selectNodeBackward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}
export const selectNodeForward: Commands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
export const liftEmptyBlock: Commands['liftEmptyBlock'] = () => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch)
}
export const createParagraphNear: Commands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
export const newlineInCode: Commands['newlineInCode'] = () => ({ state, dispatch }) => {
  return originalNewLineInCode(state, dispatch)
}
export const exitCode: Commands['exitCode'] = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}
