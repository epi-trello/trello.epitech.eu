export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(
    event,
    CardInputSchema.partial().safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const id = getRouterParam(event, 'id')

  try {
    const card = await prisma.card.update({
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
      },
      include: { labels: true, assignees: true },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignees: data.assignees
          ? {
              set: data.assignees.map((userId) => ({ id: userId }))
            }
          : undefined,
        labels: data.labels
          ? {
              set: data.labels.map((label) => ({ id: label }))
            }
          : undefined
      }
    })

    return card
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Forbidden: You do not have permission to update this card'
      })
    }

    throw error
  }
})
