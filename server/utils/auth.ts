import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { PrismaClient } from '@@/prisma/generated/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: getBaseURL(),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      firstname: { type: 'string' },
      lastname: { type: 'string' }
    },
    deleteUser: { enabled: true }
  }
})

function getBaseURL() {
  let baseURL = process.env.BETTER_AUTH_URL

  baseURL ??= getRequestURL(useEvent()).origin

  return baseURL
}
