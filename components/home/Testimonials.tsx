"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AlertCircle, BadgeCheck, Quote, RefreshCw, Star } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type {
  Testimonial,
  TestimonialsResponse,
} from "@/lib/testimonials/types"
import { notify, userMessage } from "@/lib/notify"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  )
}

function Rating({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < value ? "fill-amber-400 text-amber-400" : "text-neutral-600"
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/** Reusable card used for both student and tutor feedback. */
export function TestimonialCard({
  testimonial,
  index = 0,
}: {
  testimonial: Testimonial
  index?: number
}) {
  const roleLabel = testimonial.role === "tutor" ? "Tutor" : "Student"

  return (
    <article
      className="group flex h-full animate-[hero-fade-up_0.55s_ease-out_both] flex-col rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/30 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/20 motion-reduce:animate-none sm:p-6"
      style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      <Quote
        className="size-7 shrink-0 text-lime-400/40 transition-colors group-hover:text-lime-400/70"
        aria-hidden="true"
      />

      <p className="mt-4 line-clamp-6 grow text-sm leading-relaxed text-neutral-200">
        “{testimonial.message}”
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400/15 text-xs font-bold text-lime-300 ring-1 ring-lime-400/25">
            {testimonial.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="size-full object-cover"
              />
            ) : (
              getInitials(testimonial.name)
            )}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-white">
                {testimonial.name}
              </span>
              {testimonial.verified ? (
                <BadgeCheck
                  className="size-4 shrink-0 text-lime-400"
                  aria-label="Verified user"
                />
              ) : null}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-neutral-500">
              {roleLabel}
            </span>
          </span>
        </div>
        <Rating value={testimonial.rating} />
      </div>
    </article>
  )
}

function TestimonialSkeleton() {
  return (
    <div
      className="rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 sm:p-6"
      aria-hidden="true"
    >
      <Skeleton className="size-7 rounded-lg bg-white/10" />
      <Skeleton className="mt-5 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full bg-white/10" />
          <div>
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="mt-2 h-2.5 w-14 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-4 w-24 bg-white/10" />
      </div>
    </div>
  )
}

function StatePanel({
  tone,
  icon,
  title,
  description,
  onRetry,
}: {
  tone: "empty" | "error"
  icon: ReactNode
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-900/70 px-6 py-14 text-center shadow-lg shadow-black/10">
      <span
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-2xl ring-1",
          tone === "error"
            ? "bg-rose-400/10 text-rose-300 ring-rose-400/25"
            : "bg-lime-400/10 text-lime-300 ring-lime-400/25"
        )}
      >
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTestimonials() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/testimonials", {
          cache: "no-store",
          signal: controller.signal,
        })
        const data: TestimonialsResponse | { error?: string } =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data && "error" in data && typeof data.error === "string"
              ? data.error
              : "Could not load testimonials."
          )
        }

        setTestimonials(
          Array.isArray((data as TestimonialsResponse).testimonials)
            ? (data as TestimonialsResponse).testimonials
            : []
        )
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return
        }
        const message = userMessage(fetchError, "Could not load testimonials.")
        setError(message)
        notify.error("Could not load testimonials", message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadTestimonials()
    return () => controller.abort()
  }, [retryKey])

  const gridClass = "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"

  let content: ReactNode
  if (loading) {
    content = (
      <div
        className={gridClass}
        role="status"
        aria-label="Loading testimonials"
      >
        {[0, 1, 2].map((item) => (
          <TestimonialSkeleton key={item} />
        ))}
      </div>
    )
  } else if (error) {
    content = (
      <StatePanel
        tone="error"
        icon={<AlertCircle className="size-6" aria-hidden="true" />}
        title="Could not load feedback"
        description={error}
        onRetry={() => setRetryKey((current) => current + 1)}
      />
    )
  } else if (testimonials.length === 0) {
    content = (
      <StatePanel
        tone="empty"
        icon={<Quote className="size-6" aria-hidden="true" />}
        title="No testimonials yet"
        description="Stories from our students and tutors will appear here once they are approved."
      />
    )
  } else {
    content = (
      <div className={gridClass}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/3 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            <Star
              className="size-3.5 shrink-0 fill-lime-400 text-lime-400"
              aria-hidden="true"
            />
            Community voices
          </span>
          <h2
            id="testimonials-heading"
            className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            What students &amp; tutors{" "}
            <span className="text-lime-400">say</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Real feedback from the MentorLagbe community, shared after review by
            our team.
          </p>
        </div>

        <div className="mt-10">{content}</div>
      </div>
    </section>
  )
}
