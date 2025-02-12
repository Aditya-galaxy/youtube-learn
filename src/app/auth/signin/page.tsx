import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import SignInButton from "@/components/auth/SignInButton"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function SignIn() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            Welcome Back
          </h1>
          <p className="text-zinc-400">
            Sign in to access educational content
          </p>
        </div>
        <SignInButton />
      </div>
    </div>
  )
}