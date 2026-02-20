export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const cardId = getRouterParam(event, 'id')

  const cardAccess = await prisma.card.findFirst({
    where: {
      id: cardId,
      list: {
        board: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      }
    },
    select: { id: true }
  })

  if (!cardAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const comments = await prisma.comment.findMany({
    where: { cardId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  })

  return comments
})
