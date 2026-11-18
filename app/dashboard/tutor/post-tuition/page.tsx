import { Sparkles } from "lucide-react"

import { PostTuitionForm } from "@/components/tutor/post-tuition-form"

export const metadata = {
  title: "Post a Tuition | MentorLagbe",
}

export default function PostTuitionPage() {
  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-lime-400/8 blur-[120px]" />

      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-lime-300 uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Tutor tools
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Post a New Tuition
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
          Find the perfect student by sharing your tuition requirements.
        </p>
      </header>

      <PostTuitionForm />
    </main>
  )
}
