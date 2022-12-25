import { focus } from './fundamentals/focus'
import { scrollIntoView } from './fundamentals/scrollIntoView'
import { first } from './fundamentals/first'
import { command } from './fundamentals/defineCommand'
import { undoInputRule } from './fundamentals/undoInputRule'
import { clearNodes } from './fundamentals/clearNodes'
import { splitBlock } from './fundamentals/splitBlock'
import { setTextSelection } from './fundamentals/setTextSelection'
import { selectAll } from './fundamentals/selectAll'
import { setNode } from './fundamentals/setNode'
import { toggleNode } from './fundamentals/toggleNode'
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
  wrapIn,
} from './fundamentals/adaptProseMirrorCmds'
import { toggleMark } from './markOps/toggleMark'
import { setMark } from './markOps/setMark'
import { unsetMark } from './markOps/unsetMark'
import { resetAttributes } from './fundamentals/resetAttributes'
import { updateAttributes } from './fundamentals/updateAttributes'

export {
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
  wrapIn,
  createParagraphNear,
  newlineInCode,
  exitCode,
  setNode,
  toggleNode,
  updateAttributes,
  resetAttributes,

  toggleMark,
  setMark,
  unsetMark,
}

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
  wrapIn,
  createParagraphNear,
  newlineInCode,
  exitCode,
  setNode,
  toggleNode,
  updateAttributes,
  resetAttributes,

  toggleMark,
  setMark,
  unsetMark,
}
