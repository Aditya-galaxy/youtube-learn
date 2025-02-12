import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Customize your authorization logic here
      const isLoggedIn = !!token
      const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
      return isLoggedIn || !isProtectedRoute
    },
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"]
}
