import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const boardId = getRouterParam(event, 'id')

  if (!boardId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }

  const { data, error } = await readValidatedBody(
    event,
    LabelInputSchema.safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const label = await prisma.label.create({
    data: {
      id: generateId(),
      name: data.name,
      color: data.color,
      boardId
    }
  })

  return label
})
