export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const board = await prisma.board.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      lists: {
        orderBy: {
          position: 'asc'
        },
        include: {
          cards: {
            include: {
              labels: true
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
