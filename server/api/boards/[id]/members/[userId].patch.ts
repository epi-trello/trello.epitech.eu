import { z } from 'zod'

const UpdateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'])
})

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')
  const targetUserId = getRouterParam(event, 'userId')

  const { data, error } = await readValidatedBody(
    event,
    UpdateRoleSchema.safeParse
  )
  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid role provided',
      data: error.issues
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

  const isOwner = board.ownerId === session.user.id
  const isAdmin = board.members[0]?.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Only the Owner or an Admin can change roles.'
    })
  }

  if (targetUserId === board.ownerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot change the role of the board owner.'
    })
  }

  try {
    const updatedMember = await prisma.boardMember.update({
      where: {
        boardId_userId: {
          boardId: boardId!,
          userId: targetUserId!
        }
      },
      data: {
        role: data.role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return updatedMember
  } catch (e: any) {
    if (e.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Target user is not a member of this board.'
      })
    }
    throw e
  }
})
