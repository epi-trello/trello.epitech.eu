defineRouteMeta({
  openAPI: {
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      { in: 'query', name: 'title', schema: { type: 'string' } },
      { in: 'query', name: 'description', schema: { type: 'string' } },
      { in: 'query', name: 'position', schema: { type: 'number' } },
      { in: 'query', name: 'startDate', schema: { type: 'string' } },
      { in: 'query', name: 'dueDate', schema: { type: 'string' } },
      { in: 'query', name: 'labels', schema: { type: 'array', items: { type: 'string' } } },
      { in: 'query', name: 'listId', schema: { type: 'string' } }
    ]
  }
})

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(event, CardInputSchema.partial().safeParse)

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
            set: data.labels.map(label => ({ id: label }))
          }
        : undefined
    }
  })

  return card
})
