import { generateId } from 'better-auth'
import { z } from 'zod'

const CommentInputSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty')
})

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const cardId = getRouterParam(event, 'id')
  if (!cardId) {
    throw createError({ statusCode: 400, statusMessage: 'Card ID is required' })
  }

  const { data, error } = await readValidatedBody(
    event,
    CommentInputSchema.safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid input',
      data: error.issues
    })
  }

  const cardAccess = await prisma.card.findFirst({
    where: {
      id: cardId,
      list: {
        board: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      }
    },
    select: { id: true }
  })

  if (!cardAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Cannot access this card'
    })
  }

  const comment = await prisma.comment.create({
    data: {
      id: generateId(),
      text: data.text,
      cardId,
      userId: session.user.id
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  })

  return comment
})
