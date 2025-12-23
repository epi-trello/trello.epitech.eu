export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const board = await prisma.board.update({
    where: { id, ownerId: session.user.id },
    data: body
  })

  return board
})
