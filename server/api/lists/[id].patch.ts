export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await readValidatedBody(event, ListInputSchema.partial().safeParse)

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Content',
      message: error.issues[0]?.message,
      data: error.issues
    })
  }

  const id = getRouterParam(event, 'id')
  const list = await prisma.list.update({
    where: { id, board: { ownerId: session.user.id } },
    data
  })

  return list
})
