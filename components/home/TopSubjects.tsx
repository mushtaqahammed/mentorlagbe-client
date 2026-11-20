import Link from "next/link"
import {
  ArrowRight,
  Atom,
  CodeXml,
  Languages,
  Sigma,
  type LucideIcon,
} from "lucide-react"

type Subject = {
  name: string
  description: string
  icon: LucideIcon
}

const subjects: Subject[] = [
  {
    name: "Mathematics",
    description:
      "From school algebra to advanced calculus, build confidence with step-by-step guidance.",
    icon: Sigma,
  },
  {
    name: "Physics",
    description:
      "Make mechanics, waves and electromagnetism clear with practical, focused lessons.",
    icon: Atom,
  },
  {
    name: "Programming",
    description:
      "Learn to code with hands-on support in web development, algorithms and problem solving.",
    icon: CodeXml,
  },
  {
    name: "IELTS",
    description:
      "Prepare for every band with targeted practice in speaking, writing, reading and listening.",
    icon: Languages,
  },
]

export function SubjectCard({
  subject,
  index = 0,
}: {
  subject: Subject
  index?: number
}) {
  const Icon = subject.icon

  return (
    <Link
      href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
      className="group animate-[hero-fade-up_0.55s_ease-out_both] rounded-[1.5rem] motion-reduce:animate-none"
      style={{ animationDelay: `${index * 70}ms` }}
      aria-label={`Explore ${subject.name} tuitions`}
    >
      <article className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-neutral-900 hover:shadow-xl hover:shadow-lime-400/5 focus-visible:ring-4 focus-visible:ring-lime-400/30 focus-visible:outline-none sm:p-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25 transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <h3 className="mt-5 text-lg font-bold tracking-tight text-white transition-colors group-hover:text-lime-300">
          {subject.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
          {subject.description}
        </p>

        <span className="mt-auto inline-flex h-10 w-fit items-center gap-2 rounded-full bg-white/5 px-4 text-xs font-semibold text-neutral-200 transition-all duration-300 group-hover:bg-lime-400 group-hover:text-neutral-950 group-hover:shadow-lg group-hover:shadow-lime-400/20">
          Explore
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </article>
    </Link>
  )
}

export function TopSubjects() {
  return (
    <section
      aria-labelledby="top-subjects-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 right-1/4 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            <Sigma
              className="size-3.5 shrink-0 text-lime-400"
              aria-hidden="true"
            />
            Popular categories
          </span>
          <h2
            id="top-subjects-heading"
            className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            Top subjects students <span className="text-lime-400">explore</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Find the right specialist faster. Choose a subject to see matching
            tuition posts from MentorLagbe tutors.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <SubjectCard key={subject.name} subject={subject} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
