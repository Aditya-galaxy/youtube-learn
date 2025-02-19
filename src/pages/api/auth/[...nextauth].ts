import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
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
    async session({ session, token, user }: { session: any, token: any, user: any }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (token.sub) {
          session.user = {
            ...session.user,
            id: token.sub
          };
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger, isNewUser, session }: { token: any, user: any, account: any, profile?: any, trigger?: any, isNewUser?: boolean, session?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

export default NextAuth(authOptions);