import { z } from 'zod'

export const BoardInputSchema = z.object({
  name: z.string().max(255)
})

export const ListInputSchema = z.object({
  title: z.string().max(255),
  position: z.number().min(0),
  color: z.enum(['GRAY', 'RED', 'YELLOW', 'GREEN', 'SKY', 'BLUE', 'VIOLET', 'PINK']).optional(),
  boardId: z.string()
})

export const CardInputSchema = z.object({
  title: z.string().max(255),
  description: z.string().max(5000).optional(),
  position: z.number().min(0),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  listId: z.string()
})
