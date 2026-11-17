import Link from "next/link"

import { LogoMark } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex items-center gap-3">
        <LogoMark className="size-10 shrink-0 -rotate-6" />
        <h1 className="text-4xl font-bold tracking-tight">MentorLagbe</h1>
      </div>
      <p className="max-w-md text-muted-foreground">
        Find the right tutor for your tuition needs. Sign in to get started.
      </p>
      <div className="flex gap-3">
        <Link
          href="/tuitions"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-full bg-lime-400 font-semibold text-neutral-950 hover:bg-lime-300"
          )}
        >
          Browse Tuitions
        </Link>
        <Link
          href="/how-it-works"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-full"
          )}
        >
          How It Works
        </Link>
      </div>
    </main>
  )
}
