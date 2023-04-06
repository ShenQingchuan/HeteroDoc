import { ListItemExtension } from './listItem'
import { BulletListExtension } from './bulletList'
import type { EditorCore } from '../../core'

// export * from './orderedList'
// export * from './taskList'
export * from './bulletList'
export * from './listItem'

export function installListExtensions(core: EditorCore) {
  return [new ListItemExtension(core), new BulletListExtension(core)]
}
