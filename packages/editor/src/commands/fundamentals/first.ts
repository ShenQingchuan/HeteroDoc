import type { Command, CommandPrimitive, CommandProps } from '../../types'

declare global {
  interface Commands {
    first: Command<{
      commands: Command[] | ((props: CommandProps) => CommandPrimitive[])
    }>
  }
}

export const first: Commands['first'] =
  ({ commands }) =>
  (props) => {
    const items = typeof commands === 'function' ? commands(props) : commands

    for (const item of items) {
      if (item?.(props)) return true
    }

    return false
  }
