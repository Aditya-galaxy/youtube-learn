import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
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
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-4 font-display text-5xl tracking-display text-foreground">
          Sign in.
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed tracking-tightish text-muted-foreground">
          Continue with Google to keep your library, history and saved videos.
        </p>

        {message && (
          <div
            role="alert"
            className="mt-8 rounded-md bg-secondary p-5 text-left"
          >
            <p className="eyebrow text-destructive">Sign-in failed</p>
            <p className="mt-2 text-sm leading-relaxed tracking-tightish text-foreground">
              {message}
            </p>
            {/* The raw code is what maps to the NextAuth docs, so keep it
                visible rather than swallowing it. */}
            <p className="mt-2 text-xs tracking-tightish text-muted-foreground">
              Error code: {error}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
