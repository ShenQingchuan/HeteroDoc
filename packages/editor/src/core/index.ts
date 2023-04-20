import { EditorState } from 'prosemirror-state'
import { Node, Schema } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { TypeEvent } from '@hetero/shared'
import { history, redo, undo } from 'prosemirror-history'
import { getLogger } from '../utils/logger'
import { ExtensionType } from '../types'
import { createBuiltinFuncExts } from '../extensions/funcs/builtinFuncExts'
import { HelpersManager } from '../helpers/helpersManager'
import { getAllBuiltinPlugins } from '../plugins'
import { mergeSchemaSpecs } from './schema'
import { inputRules, pasteRules } from './rule'
import { CommandManager } from './commandManager'
import { ActiveManager } from './activeManager'
import type {
  EditorExtensionMap,
  EditorThemeMode,
  IEditorExtension,
  IEditorMark,
} from '../types'
import type { EditorLogger } from '../utils/logger'
import type {
  EditorStateConfig,
  PluginKey,
  Plugin as ProseMirrorPlugin,
  Transaction,
} from 'prosemirror-state'
import type { PatternRule } from './rule'
import type { EditorCoreEvent } from './events'

export interface EditorOptions {
  container: string | HTMLElement // editor mount point
  isReadOnly: boolean // editor mode
  doc?: any // given document data to initialize editor
  autofocus?: boolean
  isOffline?: boolean
}

export class EditorCore extends TypeEvent<EditorCoreEvent> {
  options: EditorOptions
  extensions: IEditorExtension[]
  themeMode: EditorThemeMode
  schema: Schema
  view: EditorView
  logger: EditorLogger
  cmdManager: CommandManager
  helpers: HelpersManager
  activeManager: ActiveManager
  isNoEffectDispatch = false
  i18nTr: (key: string) => string

  status = {
    isDragging: false,
  }

  constructor(
    options: EditorOptions,
    coreConfig: {
      i18nTr: (key: string) => string
      extensions: (core: EditorCore) => IEditorExtension[]
      themeMode: EditorThemeMode
    }
  ) {
    super()
    const { extensions, i18nTr, themeMode } = coreConfig
    this.options = options
    this.i18nTr = i18nTr
    this.themeMode = themeMode
    this.extensions = [...createBuiltinFuncExts(this), ...extensions(this)]

    // Initialize schema and commands set needs extensions to be ready
    this.schema = this.initSchema()
    this.cmdManager = new CommandManager(this)
    this.helpers = new HelpersManager(this)
    this.activeManager = new ActiveManager(this)
    this.logger = getLogger('HeteroEditor core')
    this.view = this.initEditorView()

    // listen the theme mode change event
    this.listenThemeModeChange()
  }

  private dispatchTransaction = (tr: Transaction) => {
    const emitIfNeedEffect = this.isNoEffectDispatch
      ? () => undefined
      : this.emit.bind(this)
    try {
      const { view } = this
      emitIfNeedEffect('beforeDispatchTransaction', { tr })
      this.extensions.forEach((ext) => ext.beforeTransaction?.())
      const prevState = view.state
      const newState = view.state.apply(tr)
      const selectionHasChanged = !view.state.selection.eq(newState.selection)

      view.updateState(newState)
      this.extensions.forEach((ext) => ext.afterApplyTransaction?.())
      emitIfNeedEffect('dispatchedTransaction', null)

      if (selectionHasChanged) {
        const onSelectionChangeParams = { tr, prevState }
        this.emit('selectionChange', onSelectionChangeParams)
        this.extensions.forEach((ext) =>
          ext.onSelectionChange?.(onSelectionChangeParams)
        )
      }
    } catch (err) {
      this.logger.error(err)
    }
  }

  private listenThemeModeChange = () => {
    this.on('changeTheme', ({ theme }) => {
      this.themeMode = theme
      const { tr } = this.view.state
      let posCursor = 0
      tr.doc.content.forEach((node) => {
        tr.doc.nodesBetween(posCursor, node.nodeSize, (node, pos) => {
          if (node.type.name !== 'fontFancy') {
            return
          }
          // if node has mark 'fontFancy', need to recreate a new mark, but maintain its own attrs,
          // just for force re-render the marked node
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, theme })
        })
        posCursor += node.nodeSize
      })

      this.noEffectDispatch(tr)
    })
  }

  private resolveAllPlugins = () => {
    // With ProseMirror, first plugins within an array are executed first.
    // In tiptap, we provide the ability to override plugins,
    // so it feels more natural to run plugins at the end of an array first.
    // That’s why we have to reverse the `extensions` array
    const extensions = this.extensions.reverse()

    // Resolve editor extensions' specs
    const allInputRules = extensions.reduce(
      (prev, curr) => [...prev, ...(curr.inputRules?.() ?? [])],
      [] as PatternRule[]
    )
    const allPasteRules = extensions.reduce(
      (prev, curr) => [...prev, ...(curr.pasteRules?.() ?? [])],
      [] as PatternRule[]
    )
    const allKeymapPlugins = extensions.reduce((prev, curr) => {
      const bindings = Object.fromEntries(
        Object.entries(curr.keymaps?.() || {}).map(
          ([shortcut, keybindingHandler]) => {
            return [
              shortcut,
              (
                state: EditorState,
                dispatch?: (tr: Transaction) => void,
                view?: EditorView
              ) => keybindingHandler(this, state, dispatch, view),
            ]
          }
        )
      )

      const keyMapPlugin = keymap(bindings)
      return [...prev, keyMapPlugin]
    }, [] as ProseMirrorPlugin[])
    const proseMirrorPluginsByExtensions = extensions.reduce(
      (prev, curr) => [...prev, ...(curr.getProseMirrorPlugin?.() ?? [])],
      [] as ProseMirrorPlugin[]
    )
    const offlinePlugins = [
      history(),
      keymap({
        'Mod-z': undo,
        'Shift-Mod-z': redo,
      }),
    ]

    let allResolved = [
      ...getAllBuiltinPlugins(this),
      ...inputRules({ core: this, rules: allInputRules }),
      ...pasteRules({ core: this, rules: allPasteRules }),
      ...allKeymapPlugins,
      ...proseMirrorPluginsByExtensions,
    ]
    if (this.options.isOffline) {
      allResolved = [...allResolved, ...offlinePlugins]
    }

    return allResolved
  }

  private initEditorView = () => {
    const { schema, dispatchTransaction } = this
    const { isReadOnly, doc, container } = this.options

    let editorMountContainer: HTMLElement
    if (typeof container === 'string') {
      const queryBySelector = document.querySelector<HTMLElement>(container)
      if (queryBySelector) {
        editorMountContainer = queryBySelector
      } else {
        const errMsg = 'editor initialize failed: container not found'
        this.logger.error(errMsg)
        throw new Error(errMsg)
      }
    } else {
      editorMountContainer = container
    }

    const editorStateConfig: EditorStateConfig = {
      schema,
      plugins: this.resolveAllPlugins(),
    }
    if (doc) {
      editorStateConfig.doc = Node.fromJSON(schema, doc)
    }
    if (isReadOnly && !doc) {
      // readonly mode must be given document data
      const errMsg = 'editor initialize failed: readonly mode but no doc data'
      this.logger.error(errMsg)
      throw new Error(errMsg)
    }

    const initState = EditorState.create(editorStateConfig)
    const view = new EditorView(editorMountContainer, {
      state: initState,
      dispatchTransaction,
    })

    if (this.options.autofocus) {
      view.focus()
    }

    return view
  }

  private initSchema = () => {
    const allSchemaSpecs = this.extensions.map(
      (ext) => ext.schemaSpec?.() ?? {}
    )
    return new Schema(mergeSchemaSpecs(allSchemaSpecs))
  }

  public noEffectDispatch(tr?: Transaction) {
    this.isNoEffectDispatch = true
    this.view.dispatch(tr ?? this.view.state.tr)
    this.isNoEffectDispatch = false
  }

  public getNodeExtensions = (): IEditorExtension[] => {
    return this.extensions.filter((ext) => ext.type === ExtensionType.node)
  }

  public getMarkExtensions = (): IEditorMark[] => {
    return this.extensions.filter((ext) => ext.type === ExtensionType.mark)
  }

  public getSplittedableMarks = (): IEditorMark[] => {
    return this.getMarkExtensions().filter((markExt) => {
      return markExt.keepOnSplit
    })
  }

  public getDocJson() {
    return this.view.state.doc.toJSON()
  }

  public getProseMirrorPlugin(key: PluginKey) {
    return this.view.state.plugins.find((plugin) => plugin.spec.key === key)
  }

  public getExtension<N extends keyof EditorExtensionMap>(name: N) {
    return this.extensions.find(
      (ext) => ext.name === name
    ) as EditorExtensionMap[N]
  }

  public get isDestroyed() {
    return this.view?.isDestroyed
  }

  public get commands() {
    return this.cmdManager.getSingleCommands()
  }
}
