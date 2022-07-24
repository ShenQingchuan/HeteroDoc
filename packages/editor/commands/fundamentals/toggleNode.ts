import type { NodeType } from 'prosemirror-model'
import { getNodeType } from '../../core/helpers/getNodeType'
import { isNodeActive } from '../../core/helpers/isNodeActive'
import type { Command } from '../../types'

declare global {
  interface Commands {
    toggleNode: Command<{
      turnOn: string | NodeType
      turnOff: string | NodeType
      attrs?: Record<string, any>
    }>
  }
}

export const toggleNode: Commands['toggleNode'] = ({ turnOn, turnOff, attrs = {} }) => ({ commands, state }) => {
  const turnOnType = getNodeType(turnOn, state.schema)
  const turnOffType = getNodeType(turnOff, state.schema)
  const isActive = isNodeActive(state, turnOnType, attrs)

  if (isActive) {
    return commands.setNode({ typeOrName: turnOffType })
  }
  return commands.setNode({ typeOrName: turnOnType, attrs })
}
