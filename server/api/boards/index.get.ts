export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return boards
})
