import { canJoin } from 'prosemirror-transform'

import { findParentNode } from 'prosemirror-utils'
import { getNodeType } from '../..//helpers/getNodeType'
import { isList } from '../..//helpers/isList'
import type { Transaction } from 'prosemirror-state'
import type { NodeType } from 'prosemirror-model'
import type { Command, Commands } from '../../types'

const joinListBackwards = (tr: Transaction, listType: NodeType): boolean => {
  const list = findParentNode((node) => node.type === listType)(tr.selection)

  if (!list) {
    return true
  }

  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth)

  if (before === undefined) {
    return true
  }

  const nodeBefore = tr.doc.nodeAt(before)
  const canJoinBackwards =
    list.node.type === nodeBefore?.type && canJoin(tr.doc, list.pos)

  if (!canJoinBackwards) {
    return true
  }

  tr.join(list.pos)

  return true
}

const joinListForwards = (tr: Transaction, listType: NodeType): boolean => {
  const list = findParentNode((node) => node.type === listType)(tr.selection)

  if (!list) {
    return true
  }

  const after = tr.doc.resolve(list.start).after(list.depth)

  if (after === undefined) {
    return true
  }

  const nodeAfter = tr.doc.nodeAt(after)
  const canJoinForwards =
    list.node.type === nodeAfter?.type && canJoin(tr.doc, after)

  if (!canJoinForwards) {
    return true
  }

  tr.join(after)

  return true
}

declare module '@hetero/editor' {
  interface Commands {
    /**
     * Toggle between different list types.
     */
    toggleList: Command<{
      listTypeOrName: string | NodeType
      itemTypeOrName: string | NodeType
      keepMarks?: boolean
      attributes?: Record<string, any>
    }>
  }
}

export const toggleList: Commands['toggleList'] =
  ({ listTypeOrName, itemTypeOrName, keepMarks, attributes = {} }) =>
  ({ core, tr, state, dispatch, chain, commands, can }) => {
    const listType = getNodeType(listTypeOrName, state.schema)
    const itemType = getNodeType(itemTypeOrName, state.schema)
    const { selection, storedMarks } = state
    const { $from, $to } = selection
    const range = $from.blockRange($to)

    const marks =
      storedMarks || (selection.$to.parentOffset && selection.$from.marks())

    if (!range) {
      return false
    }

    const parentList = findParentNode((node) => isList(node.type.name, core))(
      selection
    )

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      // remove list
      if (parentList.node.type === listType) {
        return commands.liftListItem({ typeOrName: itemType })
      }

      // change list type
      if (
        isList(parentList.node.type.name, core) &&
        listType.validContent(parentList.node.content) &&
        dispatch
      ) {
        return chain()
          .command({
            fn: () => {
              tr.setNodeMarkup(parentList.pos, listType)
              return true
            },
          })
          .command({
            fn: () => joinListBackwards(tr, listType),
          })
          .command({
            fn: () => joinListForwards(tr, listType),
          })
          .run()
      }
    }
    if (!keepMarks || !marks || !dispatch) {
      return (
        chain()
          // try to convert node to default node if needed
          .command({
            fn: () => {
              const canWrapInList = can().wrapInList({
                typeOrName: listType,
                attributes,
              })

              if (canWrapInList) {
                return true
              }

              return commands.clearNodes()
            },
          })
          .wrapInList({
            typeOrName: listType,
            attributes,
          })
          .command({
            fn: () => joinListBackwards(tr, listType),
          })
          .command({
            fn: () => joinListForwards(tr, listType),
          })
          .run()
      )
    }

    return (
      chain()
        // try to convert node to default node if needed
        .command({
          fn: () => {
            const canWrapInList = can().wrapInList({
              typeOrName: listType,
              attributes,
            })

            const filteredMarks = marks.filter((mark) =>
              core
                .getSplittedableMarks()
                .map((mark) => mark.name as string)
                .includes(mark.type.name)
            )

            tr.ensureMarks(filteredMarks)

            if (canWrapInList) {
              return true
            }

            return commands.clearNodes()
          },
        })
        .wrapInList({
          typeOrName: listType,
          attributes,
        })
        .command({
          fn: () => joinListBackwards(tr, listType),
        })
        .command({
          fn: () => joinListForwards(tr, listType),
        })
        .run()
    )
  }
