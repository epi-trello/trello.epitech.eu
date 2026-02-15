export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const members = await prisma.boardMember.findMany({
    where: { boardId: id },
    include: {
      user: true
    }
  })

  const owner = await prisma.board.findUnique({
    where: { id },
    select: {
      owner: true
    }
  })

  if (!owner) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  return [owner.owner, ...members.map((member) => member.user)]
})
