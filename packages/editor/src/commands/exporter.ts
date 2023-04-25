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
import {
  insertLineAfter,
  insertLineBefore,
} from './fundamentals/insertBeforeOrAfter'
import { supportRemoveFirstLine } from './fundamentals/supportRemoveFirstLine'
import { toggleList } from './fundamentals/toggleList'
import { liftListItem } from './fundamentals/liftListItem'
import { wrapInList } from './fundamentals/wrapInList'
import { sinkListItem } from './fundamentals/sinkListItem'
import { splitListItem } from './fundamentals/splitListItem'
import { appendBlockNode } from './fundamentals/appendBlockNode'

export * from './markOps/toggleMark'
export * from './markOps/setMark'
export * from './markOps/unsetMark'

export * from './fundamentals/focus'
export * from './fundamentals/scrollIntoView'
export * from './fundamentals/first'
export * from './fundamentals/defineCommand'
export * from './fundamentals/undoInputRule'
export * from './fundamentals/clearNodes'
export * from './fundamentals/splitBlock'
export * from './fundamentals/setTextSelection'
export * from './fundamentals/selectAll'
export * from './fundamentals/setNode'
export * from './fundamentals/toggleNode'
export * from './fundamentals/adaptProseMirrorCmds'
export * from './fundamentals/resetAttributes'
export * from './fundamentals/updateAttributes'
export * from './fundamentals/insertBeforeOrAfter'
export * from './fundamentals/supportRemoveFirstLine'
export * from './fundamentals/appendBlockNode'

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
  insertLineBefore,
  insertLineAfter,
  supportRemoveFirstLine,
  toggleList,
  liftListItem,
  wrapInList,
  sinkListItem,
  splitListItem,
  appendBlockNode,
  toggleMark,
  setMark,
  unsetMark,
}
