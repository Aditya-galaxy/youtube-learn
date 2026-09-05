import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="eyebrow">Signed in</p>
          <h1 className="mt-2 font-display text-4xl tracking-display text-foreground sm:text-5xl">
            {session.user.name}
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="flex items-center gap-4 pt-10">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt=""
            width={56}
            height={56}
            className="rounded-full"
          />
        )}
        <p className="text-sm tracking-tightish text-muted-foreground">
          {session.user.email}
        </p>
      </div>
    </div>
  );
}
