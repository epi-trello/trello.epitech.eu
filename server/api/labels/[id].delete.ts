export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const label = await prisma.label.delete({
    where: { id, board: { ownerId: session.user.id } }
  })

  return label
})
