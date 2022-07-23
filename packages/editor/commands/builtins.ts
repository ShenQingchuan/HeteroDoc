import { focus } from './fundamentals/focus'
import { scrollIntoView } from './fundamentals/scrollIntoView'
import { first } from './fundamentals/first'
import { command } from './fundamentals/defineCommand'
import { undoInputRule } from './fundamentals/undoInputRule'
import { clearNodes } from './fundamentals/clearNodes'
import { splitBlock } from './fundamentals/splitBlock'
import { setTextSelection } from './fundamentals/setTextSelection'
import { selectAll } from './fundamentals/selectAll'
import {
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  newlineInCode,
  selectNodeBackward,
  selectNodeForward,
} from './fundamentals/adaptProseMirrorCmds'
import { toggleMark } from './markOps/toggleMark'
import { setMark } from './markOps/setMark'
import { unsetMark } from './markOps/unsetMark'

export const builtinsCommands = {
  focus,
  scrollIntoView,
  first,
  command,
  undoInputRule,
  clearNodes,
  splitBlock,
  setTextSelection,
  selectAll,
  deleteSelection,
  selectNodeBackward,
  selectNodeForward,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  createParagraphNear,
  newlineInCode,
  exitCode,

  toggleMark,
  setMark,
  unsetMark,
}
