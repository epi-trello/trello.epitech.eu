export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const board = await prisma.board.findUnique({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      owner: true,
      members: {
        include: {
          user: true
        }
      },
      lists: {
        orderBy: {
          position: 'asc'
        },
        include: {
          cards: {
            include: {
              labels: true,
              assignees: true
            },
            orderBy: {
              position: 'asc'
            }
          }
        }
      }
    }
  })

  return board
})
