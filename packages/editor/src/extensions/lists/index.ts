import { ListItemExtension } from './listItem'
import { BulletListExtension } from './bulletList'
import { OrderedListExtension } from './orderedList'
import type { EditorCore } from '../../core'

// export * from './taskList'
export * from './orderedList'
export * from './bulletList'
export * from './listItem'

export function installListExtensions(core: EditorCore) {
  return [
    new ListItemExtension(core),
    new BulletListExtension(core),
    new OrderedListExtension(core),
  ]
}
