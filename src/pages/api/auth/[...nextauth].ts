import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Extend the Session type for better TypeScript support
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
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
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl'
          ].join(' '),
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub ?? user.id;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.profile = profile;
      }
      return token;
    }
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
      try {
        await prisma.userLoginEvent.create({
          data: {
            userId: user.id,
            email: user.email || '',
            eventType: 'SIGNIN',
            timestamp: new Date()
          }
        });
      } catch (error) {
        console.error('Failed to log user signin:', error);
      }
    },
    async signOut({ session }) {
      if (session?.user) {
        console.log(`User signed out: ${session.user.email}`);
        try {
          await prisma.UserLoginEvent.create({
            data: {
              userId: session.user.id,
              email: session.user.email || '',
              eventType: 'SIGNOUT',
              timestamp: new Date()
            }
          });
        } catch (error) {
          console.error('Failed to log user signout:', error);
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
};

export default NextAuth(authOptions);