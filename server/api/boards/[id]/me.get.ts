export default defineEventHandler(async (event) => {
  // 1. Authentification
  const session = await auth.api.getSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  if (!boardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board ID is required'
    })
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: {
        where: { userId: session.user.id },
        select: { role: true }
      }
    }
  })

  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  const isOwner = board.ownerId === session.user.id
  const memberRecord = board.members[0]
  const role = memberRecord?.role || null

  if (!isOwner && !memberRecord) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return {
    userId: session.user.id,
    isOwner,
    role: isOwner ? 'OWNER' : role,
    permissions: {
      canManageMembers: isOwner || role === 'ADMIN',
      canEditCards: isOwner || role === 'ADMIN' || role === 'MEMBER',
      canDeleteBoard: isOwner
    }
  }
})
