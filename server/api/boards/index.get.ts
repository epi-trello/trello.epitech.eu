export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boards = await prisma.board.findMany({
    where: { ownerId: session.user.id }
  })

  return boards
})
