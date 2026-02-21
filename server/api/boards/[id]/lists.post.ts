import { generateId } from 'better-auth'
import { broadcastToBoard } from '../../../utils/realtime'

const POSITION_GAP = 1000

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')

  if (!boardId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }

  const { data, error } = await readValidatedBody(
    event,
    ListInputSchema.safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const isAuthorized = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { ownerId: session.user.id },
        {
          members: {
            some: {
              userId: session.user.id,
              role: { in: ['ADMIN', 'MEMBER'] }
            }
          }
        }
      ]
    },
    select: { id: true }
  })

  if (!isAuthorized) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Forbidden: You do not have permission to create lists on this board.'
    })
  }

  const aggregation = await prisma.list.aggregate({
    _max: { position: true },
    where: { boardId }
  })

  const currentMax = aggregation._max.position || 0
  const newPosition = currentMax + POSITION_GAP

  const list = await prisma.list.create({
    data: {
      id: generateId(),
      title: data.title,
      position: newPosition,
      color: data.color,
      boardId
    }
  })

  broadcastToBoard(boardId, { type: 'list:create' })

  return list
})
