export { default } from "next-auth/middleware";

/**
 * Only /dashboard requires a session. The matcher used to also list
 * /profile, but the `authorized` callback returned true for anything outside
 * /dashboard, so the middleware ran on /profile and then allowed it through —
 * the rule was dead. /profile intentionally has a signed-out preview state, so
 * it stays public and the matcher now says so.
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
