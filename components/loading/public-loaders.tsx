import {
  CardSkeleton,
  LoaderSection,
  PageLoader,
  SectionHeadingSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
} from "@/components/loading/primitives"

function BannerSkeleton() {
  return (
    <LoaderSection className="border-t-0" contentClassName="py-14 sm:py-20 lg:py-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div aria-hidden="true">
          <Skeleton className="h-8 w-64 max-w-full rounded-full bg-white/10" />
          <Skeleton className="mt-6 h-12 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-3 h-12 w-4/5 max-w-lg bg-white/10" />
          <Skeleton className="mt-6 h-4 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-lg bg-white/10" />
          <SkeletonButton className="mt-8 h-12 w-44" />
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-4 w-36 bg-white/10" />
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-xl">
          <Skeleton className="aspect-4/3 w-full rounded-[2rem] bg-white/10 sm:rounded-[2.5rem]" />
          <div className="absolute -top-5 -right-3 hidden w-56 gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 sm:flex">
            <Skeleton className="size-8 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-2.5 w-20 bg-white/10" />
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden w-56 gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 sm:flex">
            <Skeleton className="size-8 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-2.5 w-20 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </LoaderSection>
  )
}

function SubjectCardSkeleton() {
  return (
    <CardSkeleton
      header={
        <div className="flex items-start justify-between">
          <Skeleton className="size-12 rounded-2xl bg-white/10" />
          <Skeleton className="h-3 w-10 bg-white/10" />
        </div>
      }
      footer={<SkeletonButton className="h-10 w-24" />}
    >
      <Skeleton className="mt-5 h-6 w-3/4 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-5/6 bg-white/10" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
    </CardSkeleton>
  )
}

function WorkflowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 shadow-lg shadow-black/10 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton className="size-11 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="h-3 w-56 max-w-full bg-white/10" />
          </div>
        </div>
        <SkeletonBadge className="w-28" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((step) => (
          <CardSkeleton
            key={step}
            className="bg-neutral-900/70"
            header={
              <div className="flex items-start justify-between">
                <Skeleton className="size-12 rounded-2xl bg-white/10" />
                <Skeleton className="h-6 w-8 bg-white/10" />
              </div>
            }
          >
            <Skeleton className="mt-5 h-4 w-3/4 bg-white/10" />
            <Skeleton className="mt-3 h-3 w-full bg-white/10" />
            <Skeleton className="mt-2 h-3 w-4/5 bg-white/10" />
          </CardSkeleton>
        ))}
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <CardSkeleton
      className="bg-neutral-900/70"
      header={
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-28 bg-white/10" />
          <Skeleton className="size-11 rounded-xl bg-white/10" />
        </div>
      }
    >
      <Skeleton className="mt-6 h-9 w-24 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-40 max-w-full bg-white/10" />
    </CardSkeleton>
  )
}

/** Shared by the home Featured section and the /tuitions listing. */
export function TuitionCardSkeleton() {
  return (
    <CardSkeleton
      header={
        <div className="flex items-start justify-between gap-3">
          <SkeletonBadge className="w-28" />
          <SkeletonBadge className="w-16" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <SkeletonAvatar className="size-9" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-2.5 w-20 bg-white/10" />
            </div>
          </div>
          <SkeletonButton className="h-9 w-28" />
        </div>
      }
    >
      <Skeleton className="mt-5 h-5 w-3/4 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((tile) => (
          <Skeleton key={tile} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-4 h-14 rounded-xl bg-white/10" />
    </CardSkeleton>
  )
}

function TestimonialCardSkeleton() {
  return (
    <CardSkeleton
      header={<Skeleton className="size-7 rounded-lg bg-white/10" />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkeletonAvatar />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-2.5 w-14 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
      }
    >
      <Skeleton className="mt-5 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
      <Skeleton className="mt-8 h-3 w-1/2 bg-white/10" />
    </CardSkeleton>
  )
}

export function HomeLoader() {
  return (
    <PageLoader label="Loading home page" contentClassName="max-w-none px-0 py-0">
      <BannerSkeleton />

      <LoaderSection>
        <SectionHeadingSkeleton />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((subject) => (
            <SubjectCardSkeleton key={subject} />
          ))}
        </div>
      </LoaderSection>

      <LoaderSection>
        <SectionHeadingSkeleton />
        <div className="mt-12 space-y-8 lg:mt-14 lg:space-y-10">
          <WorkflowSkeleton />
          <WorkflowSkeleton />
        </div>
      </LoaderSection>

      <LoaderSection>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeadingSkeleton />
          <Skeleton className="h-9 w-44 rounded-full bg-white/10" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((stat) => (
            <StatCardSkeleton key={stat} />
          ))}
        </div>
      </LoaderSection>

      <LoaderSection>
        <SectionHeadingSkeleton />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((tuition) => (
            <TuitionCardSkeleton key={tuition} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <SkeletonButton className="h-12 w-48" />
        </div>
      </LoaderSection>

      <LoaderSection>
        <SectionHeadingSkeleton />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((testimonial) => (
            <TestimonialCardSkeleton key={testimonial} />
          ))}
        </div>
      </LoaderSection>
    </PageLoader>
  )
}

export function TuitionsLoader() {
  return (
    <PageLoader label="Loading tuitions" contentClassName="max-w-none px-0 py-0">
      <LoaderSection
        className="border-t-0 border-b"
        contentClassName="py-14 sm:py-16 lg:py-20"
      >
        <div aria-hidden="true">
          <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
          <Skeleton className="mt-6 h-14 w-2/3 max-w-2xl bg-white/10" />
          <Skeleton className="mt-5 h-4 w-full max-w-2xl bg-white/10" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-xl bg-white/10" />
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-4 w-36 bg-white/10" />
            ))}
          </div>
        </div>
      </LoaderSection>

      <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4 shadow-lg shadow-black/10 sm:rounded-[1.5rem] sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-12 flex-1 rounded-xl bg-white/10" />
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((filter) => (
                <Skeleton
                  key={filter}
                  className="h-10 w-16 rounded-full bg-white/10"
                />
              ))}
              <Skeleton className="size-10 shrink-0 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <Skeleton className="h-3 w-48 bg-white/10" />
          </div>
        </div>
      </div>

      <LoaderSection className="pt-12 pb-16 lg:pt-14">
        <div aria-hidden="true">
          <Skeleton className="h-3 w-40 bg-white/10" />
          <Skeleton className="mt-2 h-8 w-52 bg-white/10" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((tuition) => (
            <TuitionCardSkeleton key={tuition} />
          ))}
        </div>
      </LoaderSection>
    </PageLoader>
  )
}

export function TuitionDetailLoader() {
  return (
    <PageLoader label="Loading tuition details" contentClassName="py-8 lg:py-10">
      <div aria-hidden="true">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="mt-6 h-44 w-full rounded-[2rem] bg-white/10" />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <CardSkeleton>
              <Skeleton className="h-5 w-40 bg-white/10" />
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3, 4, 5].map((tile) => (
                  <Skeleton key={tile} className="h-14 rounded-xl bg-white/10" />
                ))}
              </div>
            </CardSkeleton>
            <CardSkeleton>
              <Skeleton className="h-5 w-36 bg-white/10" />
              <Skeleton className="mt-5 h-3 w-full bg-white/10" />
              <Skeleton className="mt-2 h-3 w-5/6 bg-white/10" />
              <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
              <Skeleton className="mt-8 h-3 w-full bg-white/10" />
            </CardSkeleton>
          </div>
          <CardSkeleton className="h-fit lg:sticky lg:top-6">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <Skeleton className="mt-3 h-9 w-32 bg-white/10" />
            <Skeleton className="mt-3 h-3 w-20 bg-white/10" />
            <SkeletonButton className="mt-6 h-11 w-full" />
            <Skeleton className="mx-auto mt-3 h-3 w-40 bg-white/10" />
          </CardSkeleton>
        </div>
      </div>
    </PageLoader>
  )
}

function PricingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-neutral-900/70 p-6 shadow-xl shadow-black/20 sm:p-8"
    >
      <div className="flex items-start justify-between">
        <Skeleton className="size-11 rounded-xl bg-white/10" />
        <SkeletonBadge className="w-24" />
      </div>
      <Skeleton className="mt-6 h-7 w-40 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-3/4 bg-white/10" />
      <Skeleton className="mt-6 h-10 w-32 bg-white/10" />
      <div className="mt-6 flex-1 space-y-3">
        {[0, 1, 2, 3].map((benefit) => (
          <div key={benefit} className="flex items-center gap-2.5">
            <Skeleton className="size-4.5 rounded-full bg-white/10" />
            <Skeleton className="h-3 w-3/4 bg-white/10" />
          </div>
        ))}
      </div>
      <SkeletonButton className="mt-8 h-11 w-full" />
    </div>
  )
}

export function PricingLoader() {
  return (
    <PageLoader label="Loading pricing" contentClassName="max-w-6xl">
      <div aria-hidden="true">
        <SectionHeadingSkeleton align="center" />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <PricingCardSkeleton />
          <PricingCardSkeleton />
        </div>
        <Skeleton className="mx-auto mt-8 h-3 w-64 bg-white/10" />
      </div>
    </PageLoader>
  )
}

export function HowItWorksLoader() {
  return (
    <PageLoader label="Loading how it works" className="bg-neutral-900">
      <LoaderSection>
        <SectionHeadingSkeleton />
        <div className="mt-12 space-y-8 lg:mt-14 lg:space-y-10">
          <WorkflowSkeleton />
          <WorkflowSkeleton />
        </div>
        <div className="mt-12 rounded-[2rem] border border-white/10 bg-neutral-900/70 px-6 py-12 text-center sm:px-10">
          <Skeleton className="mx-auto h-8 w-72 max-w-full bg-white/10" />
          <Skeleton className="mx-auto mt-4 h-3 w-full max-w-md bg-white/10" />
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SkeletonButton className="mx-auto h-12 w-40 sm:mx-0" />
            <SkeletonButton className="mx-auto h-12 w-40 sm:mx-0" />
          </div>
        </div>
      </LoaderSection>
    </PageLoader>
  )
}

export function PaymentLoader() {
  return (
    <PageLoader label="Loading checkout" contentClassName="max-w-6xl py-12 sm:py-16">
      <div aria-hidden="true">
        <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
        <Skeleton className="mx-auto mt-10 h-8 w-64 max-w-full bg-white/10" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CardSkeleton>
            <Skeleton className="size-11 rounded-xl bg-white/10" />
            <Skeleton className="mt-5 h-6 w-48 bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl bg-white/10" />
              <Skeleton className="h-14 w-full rounded-xl bg-white/10" />
            </div>
          </CardSkeleton>
          <CardSkeleton>
            <Skeleton className="size-11 rounded-xl bg-white/10" />
            <Skeleton className="mt-5 h-6 w-52 bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-20 w-full rounded-xl bg-white/10" />
              <Skeleton className="h-20 w-full rounded-xl bg-white/10" />
            </div>
            <SkeletonButton className="mt-6 h-11 w-full" />
          </CardSkeleton>
        </div>
      </div>
    </PageLoader>
  )
}

export function PaymentSuccessLoader() {
  return (
    <PageLoader label="Loading payment confirmation" contentClassName="max-w-2xl py-12 sm:py-16">
      <div aria-hidden="true">
        <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
        <CardSkeleton className="mt-10 py-10 text-center sm:py-14">
          <Skeleton className="mx-auto size-14 rounded-2xl bg-white/10" />
          <Skeleton className="mx-auto mt-6 h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="mx-auto mt-5 h-8 w-56 max-w-full bg-white/10" />
          <Skeleton className="mx-auto mt-4 h-3 w-80 max-w-full bg-white/10" />
          <Skeleton className="mx-auto mt-8 h-12 w-full max-w-sm rounded-xl bg-white/10" />
          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 p-5 text-left">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center justify-between gap-4">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-3 w-32 bg-white/10" />
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SkeletonButton className="mx-auto h-11 w-44 sm:mx-0" />
            <SkeletonButton className="mx-auto h-11 w-36 sm:mx-0" />
          </div>
        </CardSkeleton>
      </div>
    </PageLoader>
  )
}

/** Auth screens use their own split layout, so they do not use PageLoader. */
export function AuthLoader({ fields = 2 }: { fields?: number }) {
  return (
    <main
      role="status"
      aria-label="Loading authentication form"
      aria-busy="true"
      className="grid min-h-[calc(100svh-4rem)] bg-neutral-950 text-white lg:grid-cols-2"
    >
      <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14" aria-hidden="true">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg bg-white/10" />
          <Skeleton className="h-5 w-36 bg-white/10" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm bg-white/10" />
            <Skeleton className="h-10 w-4/5 max-w-xs bg-white/10" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2].map((feature) => (
              <Skeleton key={feature} className="h-4 w-64 bg-white/10" />
            ))}
          </div>
        </div>
        <Skeleton className="h-3 w-52 bg-white/10" />
      </section>

      <section className="flex flex-col items-center justify-center p-6 sm:p-10" aria-hidden="true">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Skeleton className="size-6 rounded-md bg-white/10" />
          <Skeleton className="h-5 w-32 bg-white/10" />
        </div>
        <div className="w-full max-w-md">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="mt-3 h-3 w-72 max-w-full bg-white/10" />
          <div className="mt-8 space-y-5">
            {Array.from({ length: fields }, (_, field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
              </div>
            ))}
          </div>
          <SkeletonButton className="mt-7 h-11 w-full" />
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-px flex-1 bg-white/10" />
            <Skeleton className="h-3 w-8 bg-white/10" />
            <Skeleton className="h-px flex-1 bg-white/10" />
          </div>
          <SkeletonButton className="mt-6 h-11 w-full" />
        </div>
        <Skeleton className="mt-8 h-4 w-64 max-w-full bg-white/10" />
      </section>
    </main>
  )
}

export function UpdateProfileLoader() {
  return (
    <PageLoader label="Loading profile settings">
      <div aria-hidden="true">
        <Skeleton className="h-10 w-72 max-w-full bg-white/10" />
        <Skeleton className="mt-4 h-3 w-full max-w-xl bg-white/10" />
        <CardSkeleton className="mt-8 max-w-2xl">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <div className="mt-6 space-y-5">
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="h-28 w-full rounded-xl bg-white/10" />
          </div>
          <SkeletonButton className="mt-6 h-11 w-full" />
        </CardSkeleton>
      </div>
    </PageLoader>
  )
}
