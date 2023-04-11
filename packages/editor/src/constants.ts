export const whiteSpaceDom = ['span', { class: 'whitespace' }, '']

// Available to be used by other packages:
export const HETERO_BLOCK_NODE_DATA_TAG = 'data-hetero-block'
export const HETERO_BLOCK_NODE_TYPE_DATA_BULLET_LIST = 'bullet-list'
export const HETERO_BLOCK_NODE_TYPE_DATA_ORDERED_LIST = 'ordered-list'
export const HETERO_BLOCK_NODE_TYPE_DATA_LIST_ITEM = 'list-item'

export const fontColorSet = [
  ['', ''],
  ['rgb(140, 140, 140)', 'rgb(102, 102, 102)'],
  ['rgb(92, 92, 92)', 'rgb(140, 140, 140)'],
  ['rgb(163, 67, 31)', 'rgb(199, 103, 67)'],
  ['rgb(240, 107, 5)', 'rgb(219, 95, 0)'],
  ['rgb(223, 171, 1)', 'rgb(200, 148, 44)'],
  ['rgb(3, 135, 102)', 'rgb(27, 167, 132)'],
  ['rgb(5, 117, 197)', 'rgb(44, 134, 252)'],
  ['rgb(74, 82, 199)', 'rgb(128, 111, 241)'],
  ['rgb(136, 49, 204)', 'rgb(184, 82, 235)'],
  ['rgb(200, 21, 182)', 'rgb(218, 78, 143)'],
  ['rgb(233, 30, 44)', 'rgb(226, 80, 88)'],
] as const
export const fontBgColorSet = [
  ['transparent', 'transparent'],
  ['rgba(140, 140, 140, 0.12)', 'rgba(102, 102, 102, 0.2)'],
  ['rgba(92, 92, 92, 0.2)', 'rgba(140, 140, 140, 0.28)'],
  ['rgba(163, 67, 31, 0.2)', 'rgba(199, 103, 67, 0.28)'],
  ['rgba(240, 107, 5, 0.2)', 'rgba(219, 95, 0, 0.28)'],
  ['rgba(240, 200, 0, 0.2)', 'rgba(200, 148, 44, 0.28)'],
  ['rgba(3, 135, 102, 0.2)', 'rgba(27, 167, 132, 0.28)'],
  ['rgba(5, 117, 197, 0.2)', 'rgba(44, 134, 252, 0.28)'],
  ['rgba(74, 82, 199, 0.2)', 'rgba(128, 111, 241, 0.28)'],
  ['rgba(136, 49, 204, 0.2)', 'rgba(184, 82, 235, 0.28)'],
  ['rgba(200, 21, 182, 0.2)', 'rgba(218, 78, 143, 0.28)'],
  ['rgba(233, 30, 44, 0.2)', 'rgba(226, 80, 88, 0.28)'],
] as const

export const PARAGRAPH_SCHEMA_NODE_NAME = 'paragraph'
export enum EXTENSION_NAMES {
  BLOCK_QUOTE = 'blockquote',
  CODE_BLOCK = 'codeBlock',
  FONT_FANCY = 'fontFancy',
  HEADING = 'heading',
  HYPERLINK = 'hyperlink',
  TEXT_ALIGN = 'textAlign',
  TEXT_IDENT = 'textIdent',
  DRAG_AND_DROP = 'dragAndDrop',
  BLOCKIFY = 'blockify',
  BASE_KEYMAP = 'baseKeymap',
  BOLD = 'bold',
  CODE = 'code',
  DELETE_LINE = 'deleteLine',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  HORIZONTAL_LINE = 'horizontalLine',
  SEARCH_AND_REPLACE = 'searchAndReplace',
  LIST_ITEM = 'listItem',
  BULLET_LIST = 'bulletList',
  ORDERED_LIST = 'orderedList',
  TASK_LIST = 'taskList',
}

export const HETERODOC_SEARCH_AND_REPLACE_CLASS_NAME =
  'heterodoc-search-and-replace'
export const HETERODOC_PLACEHOLER_CLASS_NAME = 'heterodoc-placeholder'
export const HETERODOC_HORIZONTAL_LINE_CLASS_NAME = 'heterodoc-horizontal-line'
