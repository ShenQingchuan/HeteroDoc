import type { Command, CommandProps } from '../../types'

declare global {
  interface Commands {
    command: Command<{
      fn: (props: CommandProps) => boolean
    }>
  }
}

export const command: Commands['command'] = ({ fn }) => props => fn(props)
