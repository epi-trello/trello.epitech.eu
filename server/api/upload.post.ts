import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const form = await readFormData(event)
  const image = form.get('image') as File

  if (!image) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image provided'
    })
  }

  const { url } = await put(`avatars/${session.user.id}.${image.name.split('.').pop()}`, image, {
    access: 'public',
    contentType: image.type,
    allowOverwrite: true
  })

  return { url }
})
