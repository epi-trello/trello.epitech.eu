import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const { email } = await readBody(event)

  const board = await prisma.board.findFirst({
    where: { id: boardId },
    include: { members: true }
  })

  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  if (board.ownerId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const userToInvite = await prisma.user.findUnique({ where: { email } })

  if (!userToInvite) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const isOwner = board.ownerId === userToInvite.id
  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: boardId!,
        userId: userToInvite.id
      }
    }
  })

  if (isOwner || isMember) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User is already a member of the board'
    })
  }

  try {
    const newMember = await prisma.boardMember.create({
      data: {
        id: generateId(),
        boardId: boardId!,
        userId: userToInvite.id,
        role: 'MEMBER'
      },
      include: {
        user: true
      }
    })

    return newMember
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to invite user to the board'
    })
  }
})
