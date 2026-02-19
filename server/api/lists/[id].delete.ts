export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'List ID is required' })
  }

  try {
    const list = await prisma.list.delete({
      where: {
        id,
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
    })

    return list
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Forbidden: You do not have permission to delete this list or it does not exist.'
      })
    }

    throw error
  }
})
