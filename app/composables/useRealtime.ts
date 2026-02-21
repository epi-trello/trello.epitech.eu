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

export function useRealtime(
  boardId: Ref<string> | string,
  onEvent: (event: RealtimeEvent) => void,
  options?: { onConnect?: () => void; onDisconnect?: () => void }
) {
  const idRef = computed(() =>
    typeof boardId === 'string' ? boardId : boardId.value
  )

  let eventSource: EventSource | null = null
  const isConnected = ref(false)

  function connect() {
    const id = idRef.value
    if (!id || typeof window === 'undefined') return

    const url = `/api/realtime/${id}`
    eventSource = new EventSource(url, { withCredentials: true })

    eventSource.onopen = () => {
      isConnected.value = true
      options?.onConnect?.()
    }

    eventSource.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as RealtimeEvent
        onEvent(event)
      } catch {
        // ignore
      }
    }

    eventSource.onerror = () => {
      isConnected.value = false
      options?.onDisconnect?.()
      eventSource?.close()
      eventSource = null
      setTimeout(connect, 2000)
    }
  }

  function disconnect() {
    eventSource?.close()
    eventSource = null
    isConnected.value = false
  }

  onMounted(() => {
    if (idRef.value) connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  watch(idRef, (newId, oldId) => {
    if (newId === oldId) return
    disconnect()
    if (newId) connect()
  })

  return { connect, disconnect, isConnected }
}
