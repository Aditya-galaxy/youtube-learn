import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "@/components/Dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return <DashboardClient user={session?.user || null} />;
}

