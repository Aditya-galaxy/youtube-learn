import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import type { NextAuthOptions } from 'next-auth'

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
    }
    accessToken?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/youtube.readonly'
          ].join(' ')
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email }) {
      // Only allow Google sign-in
      if (account?.provider !== 'google') {
        return false
      }
      
      // Ensure we have an email
      if (!user.email) {
        return false
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true }
      })

      if (existingUser) {
        // If the user exists but doesn't have a Google account linked,
        // we should link it
        if (!existingUser.accounts.some((acc:any) => acc.provider === 'google')) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
            }
          })
        }
      }

      return true
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    }
  },
  events: {
    async signIn({ user }) {
      try {
        await prisma.user.upsert({
          where: { email: user.email! },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: new Date(),
            image: user.image,
            lastSignIn: new Date(),
            loginCount: 1,
          },
          update: {
            name: user.name,
            image: user.image,
            lastSignIn: new Date(),
            loginCount: {
              increment: 1
            }
          },
        })
      } catch (error) {
        console.error('Error in signIn event:', error)
      }
    },
    async signOut({ session }) {
      if (session?.user?.id) {
        try {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              lastSignOut: new Date()
            }
          })
        } catch (error) {
          console.error('Error in signOut event:', error)
        }
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)