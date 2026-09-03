import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

// Surface misconfiguration as one readable log line at startup. We deliberately
// do not throw here: `next build` evaluates this module while prerendering, and
// a throw would turn a missing secret into an unexplained build failure instead
// of a clear runtime error.
const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
] as const;

const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(
    `[auth] Missing environment variables: ${missingEnv.join(", ")}. ` +
      "Sign-in will fail until these are set. See .env.example."
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Google verifies the emails it returns, and Google is the only provider
      // here, so linking by email is safe. This replaces the hand-rolled
      // account-linking that used to run inside the signIn callback and could
      // race the adapter into a unique-constraint error.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Defence in depth: the provider list already restricts this to Google.
      return account?.provider === "google" && Boolean(user.email);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // The adapter has already created/loaded the user row by this point, so
      // this only records sign-in telemetry. Failures here must not block login.
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastSignIn: new Date(),
            loginCount: { increment: 1 },
          },
        });
      } catch (error) {
        console.error("Error recording sign-in:", error);
      }
    },
    async signOut({ token }) {
      if (!token?.sub) return;
      try {
        await prisma.user.update({
          where: { id: token.sub },
          data: { lastSignOut: new Date() },
        });
      } catch (error) {
        console.error("Error recording sign-out:", error);
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
