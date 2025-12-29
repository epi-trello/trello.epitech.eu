import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(event, BoardInputSchema.safeParse)

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const board = await prisma.board.create({
    data: {
      id: generateId(),
      name: data.name,
      ownerId: session.user.id
    }
  })

  return board
})
