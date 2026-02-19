export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Card ID is required' })
  }

  try {
    const card = await prisma.card.delete({
      where: {
        id,
        list: {
          board: {
            OR: [
              { ownerId: session.user.id },
              {
                members: {
                  some: {
                    userId: session.user.id,
                    role: { in: ['ADMIN', 'MEMBER'] }
                  }
                }
              }
            ]
          }
        }
      }
    })

    return card
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Forbidden: You do not have permission to delete this card or it does not exist.'
      })
    }

    throw error
  }
})
