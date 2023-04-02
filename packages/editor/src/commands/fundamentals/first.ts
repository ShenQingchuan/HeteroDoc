import type {
  Command,
  CommandPrimitive,
  CommandProps,
  Commands,
} from '../../types'

declare module '@hetero/editor' {
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
