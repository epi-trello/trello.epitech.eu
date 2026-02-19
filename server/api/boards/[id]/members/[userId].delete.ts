export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const targetUserId = getRouterParam(event, 'userId')

  if (!boardId || !targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { members: { where: { userId: session.user.id } } }
  })

  if (!board)
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  if (targetUserId === board.ownerId)
    throw createError({
      statusCode: 403,
      statusMessage: 'Owner cannot be removed.'
    })

  const isSelfLeaving = targetUserId === session.user.id
  const isOwner = board.ownerId === session.user.id
  const isAdmin = board.members[0]?.role === 'ADMIN'

  if (!isSelfLeaving && !isOwner && !isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    const cardsToUnassign = await prisma.card.findMany({
      where: {
        list: { boardId: boardId },
        assignees: { some: { id: targetUserId } }
      },
      select: { id: true }
    })

    await prisma.$transaction(async (tx) => {
      await tx.boardMember.delete({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: targetUserId
          }
        }
      })

      if (cardsToUnassign.length > 0) {
        await tx.user.update({
          where: { id: targetUserId },
          data: {
            assignedCards: {
              disconnect: cardsToUnassign
            }
          }
        })
      }
    })

    return { success: true }
  } catch (e: any) {
    if (e.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Member not found on this board.'
      })
    }
    throw e
  }
})
