import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams?.error || "An error occurred during authentication"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            Authentication Error
          </h1>
          <p className="text-sm text-zinc-400">
            {error}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}