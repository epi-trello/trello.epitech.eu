export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const card = await prisma.card.findUnique({
    where: {
      id,
      list: {
        board: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      }
    },
    include: {
      comments: { orderBy: { createdAt: 'desc' } },
      labels: true,
      assignees: true
    }
  })

  return card
})
