import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(
    event,
    CardInputSchema.safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const card = await prisma.card.create({
    data: {
      id: generateId(),
      title: data.title,
      description: data.description,
      position: data.position,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      listId: data.listId,
      assignees: {
        connect: data.assignees?.map((userId) => ({ id: userId })) || []
      },
      labels: {
        connect: data.labels?.map((label) => ({ id: label })) || []
      }
    }
  })

  return card
})
