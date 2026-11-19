import Link from "next/link"
import {
  ArrowRight,
  FilePlus,
  GraduationCap,
  Handshake,
  Presentation,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Accent = "lime" | "sky"

type WorkflowStep = {
  title: string
  description: string
  icon: LucideIcon
}

type WorkflowSectionProps = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: Accent
  steps: WorkflowStep[]
}

const studentSteps: WorkflowStep[] = [
  {
    title: "Create an Account",
    description:
      "Register on MentorLagbe and set up your student profile in just a few minutes.",
    icon: UserPlus,
  },
  {
    title: "Find Your Tutor",
    description:
      "Browse available tuition listings and filter by subject, class level, location, and more to find the right match.",
    icon: Search,
  },
  {
    title: "Apply for Tuition",
    description:
      "Choose the tuition that fits your goals and send your application directly to the tutor.",
    icon: Send,
  },
  {
    title: "Start Learning",
    description:
      "Connect with your tutor and begin a personalized learning journey built around your needs.",
    icon: GraduationCap,
  },
]

const tutorSteps: WorkflowStep[] = [
  {
    title: "Join as a Tutor",
    description:
      "Register as a tutor and create a profile that highlights your expertise and teaching experience.",
    icon: UserPlus,
  },
  {
    title: "Post a Tuition",
    description:
      "Create a listing with subject, class level, monthly fee, location, mode, and all the details students need.",
    icon: FilePlus,
  },
  {
    title: "Receive Applications",
    description:
      "Review applications from interested students and see who is the right fit for your tuition.",
    icon: Users,
  },
  {
    title: "Connect & Teach",
    description:
      "Select suitable students, connect with them, and start teaching with confidence.",
    icon: Handshake,
  },
]

const accentStyles: Record<
  Accent,
  {
    panel: string
    headerIcon: string
    badge: string
    cardIcon: string
    stepNumber: string
    topLine: string
    cardHover: string
    arrowBorder: string
    arrowIcon: string
    glow: string
  }
> = {
  lime: {
    panel: "bg-lime-400/[0.03]",
    headerIcon: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
    badge: "border-lime-400/25 bg-lime-400/10 text-lime-300",
    cardIcon: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
    stepNumber: "text-lime-400/25 group-hover:text-lime-400/45",
    topLine: "via-lime-400/50",
    cardHover: "hover:border-lime-400/40 hover:shadow-lime-400/5",
    arrowBorder: "border-lime-400/30",
    arrowIcon: "text-lime-300",
    glow: "bg-lime-400/10",
  },
  sky: {
    panel: "bg-sky-400/[0.03]",
    headerIcon: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    badge: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    cardIcon: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    stepNumber: "text-sky-400/25 group-hover:text-sky-400/45",
    topLine: "via-sky-400/50",
    cardHover: "hover:border-sky-400/40 hover:shadow-sky-400/5",
    arrowBorder: "border-sky-400/30",
    arrowIcon: "text-sky-300",
    glow: "bg-sky-400/10",
  },
}

function StepCard({
  step,
  index,
  accent,
}: {
  step: WorkflowStep
  index: number
  accent: Accent
}) {
  const styles = accentStyles[accent]
  const Icon = step.icon

  return (
    <div className="relative flex h-full">
      <article
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-900 hover:shadow-xl sm:p-6",
          styles.cardHover,
          "animate-[hero-fade-up_0.55s_ease-out_both] motion-reduce:animate-none"
        )}
        style={{ animationDelay: `${index * 70}ms` }}
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            styles.topLine
          )}
        />

        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1",
              styles.cardIcon
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-right leading-none">
            <span className="block text-[9px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
              Step
            </span>
            <span
              className={cn(
                "mt-1 block text-2xl font-black tabular-nums transition-colors duration-300",
                styles.stepNumber
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
        </div>

        <h4 className="mt-5 text-base leading-snug font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-lime-300">
          {step.title}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {step.description}
        </p>
      </article>

      {index < 3 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-5 z-10 hidden h-8 w-10 -translate-y-1/2 items-center justify-center lg:flex"
        >
          <span className="absolute inset-x-0 h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
          <span
            className={cn(
              "relative flex size-7 items-center justify-center rounded-full border bg-neutral-950 shadow-md shadow-black/40",
              styles.arrowBorder
            )}
          >
            <ArrowRight className={cn("size-3.5", styles.arrowIcon)} />
          </span>
        </span>
      ) : null}
    </div>
  )
}

function WorkflowSection({
  id,
  title,
  description,
  icon: Icon,
  accent,
  steps,
}: WorkflowSectionProps) {
  const styles = accentStyles[accent]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-lg shadow-black/10 sm:p-7",
        styles.panel
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-3xl",
          styles.glow
        )}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
              styles.headerIcon
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3
              id={id}
              className="text-xl leading-tight font-bold tracking-tight text-white sm:text-2xl"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-neutral-400">{description}</p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase",
            styles.badge
          )}
        >
          <Sparkles className="size-3" aria-hidden="true" />4 simple steps
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <StepCard
            key={step.title}
            step={step}
            index={index}
            accent={accent}
          />
        ))}
      </div>
    </div>
  )
}

export function HowMentorLagbeWorks() {
  return (
    <section
      aria-labelledby="how-mentorlagbe-works-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -left-40 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[30rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            <Sparkles
              className="size-3.5 shrink-0 text-lime-400"
              aria-hidden="true"
            />
            Simple from start to finish
          </span>
          <h2
            id="how-mentorlagbe-works-heading"
            className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            How MentorLagbe <span className="text-lime-400">Works</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Getting started with MentorLagbe is simple. Follow a few easy steps
            to find the right tutor or start your teaching journey.
          </p>
        </div>

        <div className="mt-12 space-y-8 lg:mt-14 lg:space-y-10">
          <WorkflowSection
            id="for-students-heading"
            title="For Students"
            description="Go from browsing to learning with a clear, guided flow."
            icon={GraduationCap}
            accent="lime"
            steps={studentSteps}
          />
          <WorkflowSection
            id="for-tutors-heading"
            title="For Tutors"
            description="Set up your profile, publish a tuition, and start teaching."
            icon={Presentation}
            accent="sky"
            steps={tutorSteps}
          />
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/70 px-6 py-10 text-center shadow-xl shadow-black/20 sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-lime-400/10 blur-[100px]"
          />
          <div className="relative">
            <h3 className="text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl">
              Ready to Get Started?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
              Join MentorLagbe and make your learning or teaching journey
              easier.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/all-tuitions"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group/button h-12 rounded-full bg-lime-400 px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-lime-400/60 sm:text-base"
                )}
              >
                Find a Tutor
                <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 rounded-full border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-lime-400/50 hover:bg-lime-400/10 hover:text-lime-200 focus-visible:ring-lime-400/40 sm:text-base"
                )}
              >
                Become a Tutor
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Choose the Tutor role when you create your account.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
