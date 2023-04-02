import type { Command, CommandProps, Commands } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    command: Command<{
      fn: (props: CommandProps) => boolean
    }>
  }
}

export const command: Commands['command'] =
  ({ fn }) =>
  (props) =>
    fn(props)
