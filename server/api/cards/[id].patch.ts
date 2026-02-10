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
  const card = await prisma.card.update({
    where: { id, list: { board: { ownerId: session.user.id } } },
    data: {
      ...data,
      labels: data.labels
        ? {
            set: data.labels.map((label) => ({ id: label }))
          }
        : undefined
    }
  })

  return card
})
