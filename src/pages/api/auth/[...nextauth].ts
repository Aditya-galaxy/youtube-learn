import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
          ].join(' ')
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          id: user.id,
          profile
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? token.id as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  // Add events for logging user authentication
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`)
      console.log(`User logged in: ${user.name}`)
      try {
        // Example: Log to your analytics or monitoring service
        await fetch('/api/user-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            event: 'signin',
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.error('Failed to log user signin:', error)
      }
    },
    async signOut({ session }) {
      if (session?.user) {
        console.log(`User signed out: ${session.user.email}`)
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)