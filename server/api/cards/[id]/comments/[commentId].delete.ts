export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const commentId = getRouterParam(event, 'commentId')

  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comment ID is required'
    })
  }

  try {
    await prisma.comment.delete({
      where: {
        id: commentId,
        OR: [
          { userId: session.user.id },
          {
            card: {
              list: {
                board: {
                  OR: [
                    { ownerId: session.user.id },
                    {
                      members: {
                        some: {
                          userId: session.user.id,
                          role: 'ADMIN'
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Forbidden: You do not have permission to delete this comment, or it does not exist.'
      })
    }

    throw error
  }
})
