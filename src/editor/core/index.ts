import { EditorState } from 'prosemirror-state'
import { Node, Schema } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'

import type {
  EditorStateConfig,
  Plugin as ProseMirrorPlugin,
  Transaction,
} from 'prosemirror-state'

import { TypeEvent } from '../utils/typeEvent'
import { getLogger } from '../utils/logger'
import type { EditorLogger } from '../utils/logger'
import type { IEditorExtension } from '../extensions/editorExtension'
import { mergeSchemaSpecs } from './schema'

export interface EditorOptions {
  container: string | HTMLElement // editor mount point
  isReadOnly: boolean // editor mode
  doc?: any // given document data to initialize editor
  autofocus?: boolean
}
export interface EditorCoreEvent {
  'rendered': { timeCost: number }
}

export class EditorCore extends TypeEvent<EditorCoreEvent> {
  options: EditorOptions
  extensions: IEditorExtension[]
  schema: Schema
  view: EditorView
  logger: EditorLogger

  constructor(options: EditorOptions, extensions: IEditorExtension[] = []) {
    super()
    this.extensions = extensions
    this.options = options
    this.schema = this.getSchema()
    this.logger = getLogger('HeteroEditor core')
    this.view = this.initEditorView()
  }

  private dispatchTransaction = (tr: Transaction) => {
    try {
      const { view } = this
      // Todo: Traverse all extensions to execute their beforeTransaction hooks
      const newState = view.state.apply(tr)
      // Todo: Traverse all extensions to execute their afterTransaction hooks
      view.updateState(newState)
    }
    catch (err) {
      this.logger.error(err)
    }
  }

  private initEditorView = () => {
    const { schema, dispatchTransaction } = this
    const { isReadOnly, doc, container } = this.options
    const proseMirrorPlugins = this.extensions.reduce(
      (prev, curr) => [...prev, ...(curr.getProseMirrorPlugin?.() ?? [])],
      [] as ProseMirrorPlugin[],
    )
    let editorMountContainer: HTMLElement

    if (typeof container === 'string') {
      const queryBySelector = document.querySelector<HTMLElement>(container)
      if (queryBySelector) { editorMountContainer = queryBySelector }
      else {
        const errMsg = 'editor initialize failed: container not found'
        this.logger.error(errMsg)
        throw new Error(errMsg)
      }
    }
    else {
      editorMountContainer = container
    }

    const editorStateConfig: EditorStateConfig = { schema, plugins: proseMirrorPlugins }
    if (isReadOnly) {
      // readonly mode must be given document data
      if (doc) {
        editorStateConfig.doc = Node.fromJSON(schema, doc)
      }
      else {
        const errMsg = 'editor initialize failed: readonly mode but no doc data'
        this.logger.error(errMsg)
        throw new Error(errMsg)
      }
    }

    const initState = EditorState.create(editorStateConfig)
    const view = new EditorView(editorMountContainer, {
      state: initState,
      dispatchTransaction,
    })
    return view
  }

  public getSchema = () => {
    const allSchemaSpecs = this.extensions.map(ext => ext.schemaSpec())
    return new Schema(mergeSchemaSpecs(allSchemaSpecs))
  }
}
