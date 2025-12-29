export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const labels = await prisma.label.findMany({
    where: { boardId, board: { ownerId: session.user.id } }
  })

  return labels
})
