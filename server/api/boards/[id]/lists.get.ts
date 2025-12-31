export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const lists = await prisma.list.findMany({
    where: { boardId, board: { ownerId: session.user.id } },
    include: { cards: { include: { labels: true } } }
  })

  return lists
})
