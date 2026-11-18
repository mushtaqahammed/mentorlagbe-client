import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, GraduationCap, Video } from "lucide-react"

import { LogoMark } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const highlights = [
  { icon: BadgeCheck, label: "Verified tutors" },
  { icon: GraduationCap, label: "Personalized batches" },
  { icon: Video, label: "Learn online or in person" },
]

export function Banner() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      {/* Ambient brand glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-48 left-1/4 size-[34rem] rounded-full bg-lime-400/10 blur-[140px]" />
        <div className="absolute -right-40 -bottom-40 size-[32rem] rounded-full bg-sky-400/10 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
        {/* Copy column */}
        <div className="flex flex-col items-start">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm",
              "animate-[hero-fade-up_0.7s_ease-out_both] motion-reduce:animate-none"
            )}
          >
            <LogoMark className="size-3.5 shrink-0" />
            Your learning journey starts here
          </div>

          <h1
            className={cn(
              "mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] xl:text-6xl",
              "animate-[hero-fade-up_0.7s_ease-out_90ms_both] motion-reduce:animate-none"
            )}
          >
            Find your <span className="text-lime-400">ideal tutor</span> or
            <br className="hidden lg:block" />{" "}
            <span className="text-lime-400">mentorship batch</span> today
          </h1>

          <p
            className={cn(
              "mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg",
              "animate-[hero-fade-up_0.7s_ease-out_180ms_both] motion-reduce:animate-none"
            )}
          >
            Connect with experienced tutors, explore personalized learning
            opportunities, and find the perfect tuition that matches your
            academic goals.
          </p>

          <Link
            href="/tuitions"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group/button mt-8 h-12 rounded-full bg-lime-400 px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-lime-400/60 sm:text-base",
              "animate-[hero-fade-up_0.7s_ease-out_270ms_both] motion-reduce:animate-none"
            )}
          >
            Browse Tuitions
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-1" />
          </Link>

          <ul
            className={cn(
              "mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-400",
              "animate-[hero-fade-up_0.7s_ease-out_360ms_both] motion-reduce:animate-none"
            )}
          >
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className="size-4 shrink-0 text-lime-400"
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual column */}
        <div
          className={cn(
            "relative mx-auto w-full max-w-xl lg:max-w-none",
            "animate-[hero-fade-up_0.9s_ease-out_200ms_both] motion-reduce:animate-none"
          )}
        >
          <div
            aria-hidden="true"
            className="absolute -top-8 -right-6 size-56 rounded-full bg-lime-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -left-8 size-64 rounded-full bg-sky-400/15 blur-3xl"
          />

          <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl ring-1 shadow-black/50 ring-white/5 sm:rounded-[2.5rem]">
            {/* Unsplash photo: photo-1522202176988-66273c2fd55f */}
            <Image
              src="/hero-mentorship.jpg"
              alt="Students and a tutor collaborating around a laptop during a lesson"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              preload
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-tr from-neutral-950/50 via-transparent to-lime-400/10"
            />
          </div>

          <div
            className={cn(
              "absolute -top-5 -right-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md sm:flex",
              "animate-[hero-float_7s_ease-in-out_infinite] motion-reduce:animate-none"
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <Video className="size-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold text-white">
                Live sessions
              </span>
              <span className="block text-[11px] text-neutral-400">
                Learn from anywhere
              </span>
            </span>
          </div>

          <div
            className={cn(
              "absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md sm:flex",
              "animate-[hero-float_8s_ease-in-out_1s_infinite] motion-reduce:animate-none"
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime-400 text-neutral-950">
              <BadgeCheck className="size-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold text-white">
                Trusted mentors
              </span>
              <span className="block text-[11px] text-neutral-400">
                Matched to your goals
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
