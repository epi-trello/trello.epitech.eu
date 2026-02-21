import { generateId } from 'better-auth'
import { broadcastToBoard } from '../../utils/realtime'

const POSITION_GAP = 1000

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(
    event,
    CardInputSchema.safeParse
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
      lists: { some: { id: data.listId } },
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
        'Forbidden: You do not have permission to add cards to this list.'
    })
  }

  const boardId = isAuthorized.id

  const aggregation = await prisma.card.aggregate({
    _max: { position: true },
    where: { listId: data.listId }
  })

  const currentMax = aggregation._max.position || 0
  const newPosition = currentMax + POSITION_GAP

  const card = await prisma.card.create({
    data: {
      id: generateId(),
      title: data.title,
      description: data.description,
      position: newPosition,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      listId: data.listId,
      assignees: {
        connect: data.assignees?.map((userId) => ({ id: userId })) || []
      },
      labels: {
        connect: data.labels?.map((label) => ({ id: label })) || []
      }
    }
  })

  broadcastToBoard(boardId, { type: 'card:create', listId: data.listId })

  return card
})
