import { z } from 'zod'

export const ListInputSchema = z.object({
  title: z.string().max(255),
  position: z.number().min(0),
  color: z.enum(['GRAY', 'RED', 'YELLOW', 'GREEN', 'SKY', 'BLUE', 'VIOLET', 'PINK']).optional(),
  boardId: z.string()
})
