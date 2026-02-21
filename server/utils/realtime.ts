export type RealtimeEvent =
  | { type: 'board:update' }
  | { type: 'list:create' }
  | { type: 'list:update' }
  | { type: 'list:delete' }
  | { type: 'card:create'; listId: string }
  | { type: 'card:update'; cardId: string }
  | { type: 'card:delete'; cardId: string }
  | { type: 'comment:create'; cardId: string }
  | { type: 'comment:delete'; cardId: string }
  | { type: 'label:create' }

type Listener = (event: RealtimeEvent) => void

const listenersByBoard = new Map<string, Set<Listener>>()

export function subscribeToBoard(
  boardId: string,
  listener: Listener
): () => void {
  let set = listenersByBoard.get(boardId)
  if (!set) {
    set = new Set()
    listenersByBoard.set(boardId, set)
  }
  set.add(listener)
  return () => {
    set?.delete(listener)
    if (set?.size === 0) listenersByBoard.delete(boardId)
  }
}

/**
 * Envoie un événement temps réel à tous les clients connectés sur un board.
 */
export function broadcastToBoard(boardId: string, event: RealtimeEvent) {
  const set = listenersByBoard.get(boardId)
  if (!set) return
  for (const listener of set) {
    try {
      listener(event)
    } catch {
      // ignore
    }
  }
}
