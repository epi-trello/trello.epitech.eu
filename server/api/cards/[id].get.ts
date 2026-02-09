export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const card = await prisma.card.findUnique({
    where: { id, list: { board: { ownerId: session.user.id } } },
    include: { labels: true }
  })

  return card
})
