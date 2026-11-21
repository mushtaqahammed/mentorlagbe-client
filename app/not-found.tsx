import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Compass, Home, SearchX } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "404 - Page Not Found | MentorLagbe",
  description:
    "The page you are looking for could not be found. Head back to MentorLagbe to keep exploring tutors and tuitions.",
}

export default function NotFound() {
  return (
    <main
      aria-labelledby="not-found-heading"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      {/* Ambient brand glows, matching the public site sections */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-48 left-1/4 size-[34rem] rounded-full bg-lime-400/10 blur-[140px]" />
        <div className="absolute -right-40 -bottom-44 size-[30rem] rounded-full bg-sky-400/10 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="animate-[hero-fade-up_0.7s_ease-out_both] motion-reduce:animate-none">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3.5 py-1.5 text-xs font-medium text-lime-200">
            <Compass className="size-3.5 shrink-0" aria-hidden="true" />
            Error 404
          </span>
        </div>

        {/* Decorative 404 lockup: the middle zero becomes a search lens */}
        <div
          aria-hidden="true"
          className="relative mx-auto mt-8 w-fit animate-[hero-fade-up_0.7s_ease-out_90ms_both] motion-reduce:animate-none"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-72 max-w-[80vw] rounded-full bg-lime-400/10 blur-3xl" />
          </div>

          <p className="relative flex items-center justify-center gap-1 text-[clamp(5.5rem,20vw,9.5rem)] leading-none font-black tracking-tighter">
            <span className="bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent">
              4
            </span>
            <span className="relative mx-1 flex size-[clamp(4rem,14vw,6.75rem)] items-center justify-center rounded-full border border-lime-400/30 bg-neutral-900/80 shadow-2xl ring-1 shadow-black/50 ring-white/10 backdrop-blur-sm">
              <span className="absolute inset-2 rounded-full border border-dashed border-lime-400/20" />
              <SearchX className="size-[45%] text-lime-400" />
            </span>
            <span className="bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent">
              4
            </span>
          </p>

          <span className="absolute -top-1 -right-4 size-2.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50 sm:-right-8" />
          <span className="absolute -bottom-1 -left-3 size-2 rounded-full bg-sky-400/80 shadow-lg shadow-sky-400/40 sm:-left-7" />
        </div>

        <h1
          id="not-found-heading"
          className="mt-8 animate-[hero-fade-up_0.7s_ease-out_180ms_both] text-3xl leading-tight font-bold tracking-tight text-balance motion-reduce:animate-none sm:text-4xl lg:text-5xl"
        >
          <span className="sr-only">404 - </span>
          Oops! <span className="text-lime-400">Page Not Found</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl animate-[hero-fade-up_0.7s_ease-out_270ms_both] text-sm leading-relaxed text-neutral-300 motion-reduce:animate-none sm:text-base">
          The page you are looking for may have been moved, deleted, or does not
          exist. Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex animate-[hero-fade-up_0.7s_ease-out_360ms_both] flex-col items-center justify-center gap-3 motion-reduce:animate-none sm:flex-row">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group/button h-12 w-full rounded-full bg-lime-400 px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-lime-400/60 sm:w-auto"
            )}
          >
            <Home className="size-4" aria-hidden="true" />
            Back to Home
          </Link>

          <Link
            href="/tuitions"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group/button h-12 w-full rounded-full border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-all hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200 focus-visible:ring-lime-400/40 sm:w-auto"
            )}
          >
            Browse Tuitions
            <ArrowRight
              className="size-4 transition-transform group-hover/button:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          Still stuck?{" "}
          <a
            href="mailto:support@mentorlagbe.com"
            className="font-medium text-neutral-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-lime-300 hover:decoration-lime-400/50 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
          >
            Contact support
          </a>
        </p>
      </div>
    </main>
  )
}
