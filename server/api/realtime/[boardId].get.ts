import { subscribeToBoard } from '../../utils/realtime'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'boardId')
  if (!boardId) {
    throw createError({ statusCode: 400, statusMessage: 'Board ID required' })
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    select: { id: true }
  })
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  setHeader(event, 'cache-control', 'no-cache')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'content-type', 'text/event-stream')
  setResponseStatus(event, 200)
  event._handled = true

  let id = 0
  const push = (data: object) => {
    try {
      event.node.res.write(`id: ${++id}\n`)
      event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch {
      // client disconnected
    }
  }

  const unsubscribe = subscribeToBoard(boardId, push)

  event.node.req.on('close', () => {
    unsubscribe()
  })
})
