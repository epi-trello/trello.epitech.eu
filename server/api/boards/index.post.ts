import { generateId } from 'better-auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const board = await prisma.board.create({
    data: {
      id: generateId(),
      name: body.name,
      ownerId: session.user.id
    }
  })

  return board
})
