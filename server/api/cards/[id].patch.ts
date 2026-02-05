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
  const existing = await prisma.card.findFirst({
    where: { id, list: { board: { ownerId: session.user.id } } },
    select: { listId: true }
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const targetListId = data.listId ?? existing.listId
  const newPosition = typeof data.position === 'number' ? Math.max(0, data.position) : 0

  // Déplacement (même liste ou autre liste) : reconstruire l'ordre avec la carte à newPosition
  if (data.position !== undefined || data.listId !== undefined) {
    await prisma.card.update({
      where: { id, list: { board: { ownerId: session.user.id } } },
      data: { listId: targetListId, position: newPosition }
    })

    const cards = await prisma.card.findMany({
      where: { listId: targetListId },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      select: { id: true }
    })
    const fromIdx = cards.findIndex(c => c.id === id)
    if (fromIdx >= 0) {
      const [moved] = cards.splice(fromIdx, 1)
      if (moved) {
        const toIdx = Math.min(newPosition, cards.length)
        cards.splice(toIdx, 0, moved)
        await Promise.all(
          cards.map((c, i) =>
            prisma.card.update({ where: { id: c.id }, data: { position: i } })
          )
        )
      }
    }

    if (data.listId !== undefined && existing.listId !== data.listId) {
      const sourceCards = await prisma.card.findMany({
        where: { listId: existing.listId },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        select: { id: true }
      })
      await Promise.all(
        sourceCards.map((c, i) =>
          prisma.card.update({ where: { id: c.id }, data: { position: i } })
        )
      )
    }

    const card = await prisma.card.findUnique({ where: { id } })
    return card
  }

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
