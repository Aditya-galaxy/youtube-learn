import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import App from "@/components/App/App"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/")
  }

  return <App />
}