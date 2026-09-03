import Image from "next/image"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>
      <div className="mt-4">
        <p>Welcome, {session.user.name}</p>
        {session.user.image && (
          <Image
            src={session.user.image}
            alt=""
            width={48}
            height={48}
            className="mt-2 rounded-full"
          />
        )}
      </div>
    </div>
  )
}