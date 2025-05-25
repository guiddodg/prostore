import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/db/prisma'
import authConfig from "./auth.config"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true // Por defecto, permite todas las rutas
    }
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, //30 days
  },
  adapter: PrismaAdapter(prisma),
  ...authConfig
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)