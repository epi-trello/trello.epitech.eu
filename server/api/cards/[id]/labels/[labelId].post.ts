export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { id: cardId, labelId } = getRouterParams(event)
  const label = await prisma.label.update({
    where: { id: labelId, board: { ownerId: session.user.id } },
    data: {
      cards: {
        connect: { id: cardId }
      }
    }
  })

  return label
})
