export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'List ID is required' })
  }

  const { data, error } = await readValidatedBody(
    event,
    ListInputSchema.partial().safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  try {
    const list = await prisma.list.update({
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
      },
      data
    })

    return list
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Forbidden: You do not have permission to modify this list or it does not exist.'
      })
    }

    throw error
  }
})
