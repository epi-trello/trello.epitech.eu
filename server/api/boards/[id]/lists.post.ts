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

  const { data, error } = await readValidatedBody(event, ListInputSchema.safeParse)

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const list = await prisma.list.create({
    data: {
      id: generateId(),
      title: data.title,
      position: data.position,
      color: data.color,
      boardId
    }
  })

  return list
})
