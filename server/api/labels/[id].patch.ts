export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const { data, error } = await readValidatedBody(
    event,
    LabelInputSchema.partial().safeParse
  )

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const label = await prisma.label.update({
    where: { id, board: { ownerId: session.user.id } },
    data
  })

  return label
})
