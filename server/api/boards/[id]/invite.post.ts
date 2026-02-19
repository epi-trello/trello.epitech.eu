import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const { email } = await readBody(event)

  if (!boardId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board ID is required'
    })
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        where: { userId: session.user.id }
      }
    }
  })

  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  const isCurrentUserOwner = board.ownerId === session.user.id
  const currentUserRole = board.members[0]?.role

  if (!isCurrentUserOwner && currentUserRole !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Forbidden: Only the Owner or an Admin can invite new members.'
    })
  }

  const userToInvite = await prisma.user.findUnique({ where: { email } })

  if (!userToInvite) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const isTargetOwner = board.ownerId === userToInvite.id
  const isTargetMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: boardId,
        userId: userToInvite.id
      }
    }
  })

  if (isTargetOwner || isTargetMember) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User is already a member of the board'
    })
  }

  try {
    const newMember = await prisma.boardMember.create({
      data: {
        id: generateId(),
        boardId: boardId,
        userId: userToInvite.id,
        role: 'MEMBER'
      },
      include: {
        user: true
      }
    })

    return newMember
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to invite user to the board'
    })
  }
})
