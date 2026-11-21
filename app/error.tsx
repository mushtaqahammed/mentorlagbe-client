"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Error({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  useEffect(() => {
    // Keep diagnostics in the console only; never surface error details in the UI.
    console.error(error)
  }, [error])

  return (
    <>
      <title>Something Went Wrong | MentorLagbe</title>

      <main
        aria-labelledby="error-heading"
        className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
      >
        {/* Ambient brand glows, matching the public site sections */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-48 left-1/4 size-[34rem] rounded-full bg-lime-400/10 blur-[140px]" />
          <div className="absolute -right-40 -bottom-44 size-[30rem] rounded-full bg-rose-400/10 blur-[130px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-[hero-fade-up_0.7s_ease-out_both] motion-reduce:animate-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 px-3.5 py-1.5 text-xs font-medium text-rose-200">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
              Unexpected error
            </span>
          </div>

          {/* Decorative illustration: a warning tile in a soft orbit */}
          <div
            aria-hidden="true"
            className="relative mx-auto mt-8 w-fit animate-[hero-fade-up_0.7s_ease-out_90ms_both] motion-reduce:animate-none"
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-72 max-w-[80vw] rounded-full bg-rose-400/10 blur-3xl" />
            </div>
            <div className="pointer-events-none absolute -inset-6 rounded-full border border-dashed border-white/10" />

            <div className="relative flex size-40 animate-[hero-float_7s_ease-in-out_infinite] items-center justify-center rounded-[2.5rem] border border-white/10 bg-neutral-900/80 shadow-2xl ring-1 shadow-black/50 ring-white/10 backdrop-blur-sm motion-reduce:animate-none sm:size-48">
              <span className="absolute inset-4 rounded-[2rem] border border-white/5" />
              <span className="flex size-20 items-center justify-center rounded-3xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25 sm:size-24">
                <AlertTriangle className="size-10 sm:size-12" />
              </span>
            </div>

            <span className="absolute -top-1 -right-4 size-2.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50 sm:-right-8" />
            <span className="absolute -bottom-1 -left-3 size-2 rounded-full bg-sky-400/80 shadow-lg shadow-sky-400/40 sm:-left-7" />
          </div>

          <div role="alert">
            <h1
              id="error-heading"
              className="mt-8 animate-[hero-fade-up_0.7s_ease-out_180ms_both] text-3xl leading-tight font-bold tracking-tight text-balance motion-reduce:animate-none sm:text-4xl lg:text-5xl"
            >
              Something Went <span className="text-rose-300">Wrong!</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl animate-[hero-fade-up_0.7s_ease-out_270ms_both] text-sm leading-relaxed text-neutral-300 motion-reduce:animate-none sm:text-base">
              We hit an unexpected snag while loading this page. Your data is
              safe — please try again, or head back home if the problem keeps
              happening.
            </p>
          </div>

          <div className="mt-8 flex animate-[hero-fade-up_0.7s_ease-out_360ms_both] flex-col items-center justify-center gap-3 motion-reduce:animate-none sm:flex-row">
            <Button
              type="button"
              onClick={() => reset()}
              className={cn(
                "group/button h-12 w-full rounded-full bg-lime-400 px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-lime-400/60 sm:w-auto"
              )}
            >
              <RefreshCw
                className="size-4 transition-transform duration-500 group-hover/button:rotate-180"
                aria-hidden="true"
              />
              Try Again
            </Button>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "group/button h-12 w-full rounded-full border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-all hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200 focus-visible:ring-lime-400/40 sm:w-auto"
              )}
            >
              <Home className="size-4" aria-hidden="true" />
              Back to Home
            </Link>
          </div>

          <p className="mt-8 text-xs text-neutral-500">
            Need a hand?{" "}
            <a
              href="mailto:support@mentorlagbe.com"
              className="font-medium text-neutral-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-lime-300 hover:decoration-lime-400/50 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
            >
              Contact support
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
