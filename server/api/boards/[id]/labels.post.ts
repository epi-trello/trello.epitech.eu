import { generateId } from 'better-auth'

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
    LabelInputSchema.safeParse
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
        'Forbidden: You do not have permission to create labels on this board.'
    })
  }

  const label = await prisma.label.create({
    data: {
      id: generateId(),
      name: data.name,
      color: data.color,
      boardId
    }
  })

  return label
})
