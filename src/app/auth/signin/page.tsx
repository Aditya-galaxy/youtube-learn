import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { AlertCircle } from "lucide-react";
import SignInButton from "@/components/auth/SignInButton";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth reports failures by redirecting to `pages.error` with an `?error=`
 * code. This page is that target, so it has to render the code — without this,
 * every failed sign-in bounced the user silently back to the sign-in screen,
 * which is indistinguishable from the button doing nothing.
 *
 * Codes: https://next-auth.js.org/configuration/pages#error-codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "The server is misconfigured. Check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and NEXTAUTH_SECRET are set.",
  AccessDenied: "You declined access, or this account is not permitted.",
  Verification: "That sign-in link has expired or has already been used.",
  OAuthSignin: "Could not start the Google sign-in flow.",
  OAuthCallback:
    "Google rejected the sign-in. This usually means the client secret is wrong or the redirect URI is not registered.",
  OAuthCreateAccount:
    "Signed in with Google, but the account could not be saved. The database may be unreachable.",
  OAuthAccountNotLinked:
    "An account already exists with this email address under a different sign-in method.",
  Callback: "Something went wrong completing the sign-in.",
  SessionRequired: "Please sign in to view that page.",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const message = error
    ? (ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.")
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-popover px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to access educational content
          </p>
        </div>

        {message && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-left"
          >
            <AlertCircle
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            />
            <div className="space-y-1">
              <p className="text-sm text-foreground">{message}</p>
              {/* The raw code is what maps to the NextAuth docs, so keep it
                  visible rather than swallowing it. */}
              <p className="text-xs text-muted-foreground">
                Error code: {error}
              </p>
            </div>
          </div>
        )}

        <SignInButton />
      </div>
    </div>
  );
}
