import {
  CardSkeleton,
  DashboardLoader,
  Skeleton,
  SkeletonBadge,
  SkeletonButton,
  TableSkeleton,
} from "@/components/loading/primitives"

function StatCardSkeleton() {
  return (
    <CardSkeleton
      className="bg-neutral-950/60"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <Skeleton className="h-8 w-16 bg-white/10" />
          </div>
          <Skeleton className="size-10 rounded-xl bg-white/10" />
        </div>
      }
    >
      <Skeleton className="h-3 w-32 bg-white/10" />
    </CardSkeleton>
  )
}

function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <StatCardSkeleton key={item} />
      ))}
    </div>
  )
}

function FilterBarSkeleton({ columns = 3 }: { columns?: number }) {
  const gridClass =
    columns === 2
      ? "md:grid-cols-[minmax(0,1fr)_minmax(0,180px)]"
      : "md:grid-cols-[minmax(0,1fr)_minmax(0,180px)_minmax(0,180px)]"

  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-white/10 bg-neutral-950/60 p-4"
    >
      <div className={`grid grid-cols-1 gap-3 ${gridClass}`}>
        {Array.from({ length: columns }, (_, field) => (
          <Skeleton key={field} className="h-10 w-full rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div aria-hidden="true" className="mt-6 flex items-center justify-between gap-4">
      <Skeleton className="h-3 w-40 bg-white/10" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-lg bg-white/10" />
        <Skeleton className="h-9 w-20 rounded-lg bg-white/10" />
      </div>
    </div>
  )
}

function ApplicationCardSkeleton() {
  return (
    <CardSkeleton
      className="bg-neutral-950/60"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 max-w-full bg-white/10" />
            <Skeleton className="h-3 w-36 bg-white/10" />
          </div>
          <SkeletonBadge className="w-20" />
        </div>
      }
      footer={<SkeletonButton className="h-9 w-32" />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((tile) => (
          <Skeleton key={tile} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
    </CardSkeleton>
  )
}

function TuitionCardSkeleton() {
  return (
    <CardSkeleton
      className="bg-neutral-950/60"
      header={
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-40 max-w-full bg-white/10" />
          <SkeletonBadge className="w-20" />
        </div>
      }
      footer={
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((action) => (
            <Skeleton key={action} className="h-9 rounded-xl bg-white/10" />
          ))}
        </div>
      }
    >
      <Skeleton className="mt-3 h-4 w-24 bg-white/10" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4, 5].map((tile) => (
          <Skeleton key={tile} className="h-9 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-5 h-14 w-full rounded-xl bg-white/10" />
    </CardSkeleton>
  )
}

function ApplicantCardSkeleton() {
  return (
    <CardSkeleton
      className="bg-neutral-950/60"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="h-3 w-48 max-w-full bg-white/10" />
            </div>
          </div>
          <SkeletonBadge className="w-20" />
        </div>
      }
      footer={
        <div className="flex gap-2">
          <SkeletonButton className="h-9 w-24" />
          <SkeletonButton className="h-9 w-24" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((tile) => (
          <Skeleton key={tile} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-5 h-14 w-full rounded-xl bg-white/10" />
    </CardSkeleton>
  )
}

function ListSkeleton({
  card,
  columns = "grid-cols-1 xl:grid-cols-2",
}: {
  card: "application" | "tuition" | "applicant"
  columns?: string
}) {
  const cards = {
    application: <ApplicationCardSkeleton />,
    tuition: <TuitionCardSkeleton />,
    applicant: <ApplicantCardSkeleton />,
  }

  return (
    <div className={`mt-6 grid gap-5 ${columns}`} aria-hidden="true">
      {[0, 1, 2, 3].map((item) => (
        <div key={item}>{cards[card]}</div>
      ))}
    </div>
  )
}

export function DashboardIndexLoader() {
  return <DashboardLoader label="Loading dashboard" />
}

export function DashboardProfileLoader() {
  return (
    <DashboardLoader label="Loading profile">
      <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
        <CardSkeleton className="bg-neutral-950/60">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <div className="mt-6 space-y-5">
            {[0, 1, 2].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-2.5 w-24 bg-white/10" />
                <Skeleton className="h-4 w-48 max-w-full bg-white/10" />
              </div>
            ))}
          </div>
        </CardSkeleton>

        <CardSkeleton className="bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded bg-white/10" />
            <Skeleton className="h-5 w-32 bg-white/10" />
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-24 bg-white/10" />
                <Skeleton className="h-6 w-32 bg-white/10" />
              </div>
              <SkeletonBadge className="w-16" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full bg-white/10" />
                <Skeleton className="h-3 w-3/4 bg-white/10" />
              </div>
            ))}
          </div>
          <SkeletonButton className="mt-5 h-10 w-full" />
        </CardSkeleton>
      </div>
    </DashboardLoader>
  )
}

export function DashboardStatsLoader({
  kind = "student",
}: {
  kind?: "student" | "tutor" | "admin"
}) {
  return (
    <DashboardLoader
      label={`Loading ${kind} dashboard`}
    >
      <StatGridSkeleton />
      <div
        aria-hidden="true"
        className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-56 max-w-full bg-white/10" />
          <Skeleton className="h-3 w-72 max-w-full bg-white/10" />
        </div>
        <SkeletonButton className="h-10 w-36" />
      </div>
    </DashboardLoader>
  )
}

export function StudentApplicationsLoader() {
  return (
    <DashboardLoader label="Loading my applications">
      <StatGridSkeleton />
      <div className="mt-6">
        <FilterBarSkeleton />
      </div>
      <ListSkeleton card="application" />
    </DashboardLoader>
  )
}

export function TutorTuitionsLoader() {
  return (
    <DashboardLoader label="Loading my tuitions">
      <FilterBarSkeleton columns={2} />
      <ListSkeleton
        card="tuition"
        columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      />
    </DashboardLoader>
  )
}

export function TutorApplicantsLoader() {
  return (
    <DashboardLoader label="Loading applicants">
      <StatGridSkeleton />
      <div className="mt-6">
        <FilterBarSkeleton />
      </div>
      <ListSkeleton card="applicant" />
    </DashboardLoader>
  )
}

export function PostTuitionLoader() {
  return (
    <DashboardLoader label="Loading tuition form" bare>
      <div aria-hidden="true">
        <Skeleton className="h-7 w-36 rounded-full bg-white/10" />
        <Skeleton className="mt-5 h-10 w-72 max-w-full bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/10" />
      </div>

      <div className="mt-8 space-y-6" aria-hidden="true">
        {[
          { title: "Tuition basics", fields: 4 },
          { title: "Schedule & location", fields: 4 },
          { title: "Description", fields: 1 },
        ].map((section) => (
          <CardSkeleton
            key={section.title}
            className="bg-neutral-900/60"
            header={<Skeleton className="h-5 w-44 bg-white/10" />}
          >
            <div
              className={`mt-6 grid gap-4 ${section.fields > 1 ? "sm:grid-cols-2" : ""}`}
            >
              {Array.from({ length: section.fields }, (_, field) => (
                <div key={field} className="space-y-2">
                  <Skeleton className="h-3 w-28 bg-white/10" />
                  <Skeleton
                    className={`w-full rounded-xl bg-white/10 ${section.fields === 1 ? "h-32" : "h-11"}`}
                  />
                </div>
              ))}
            </div>
          </CardSkeleton>
        ))}

        <CardSkeleton className="bg-neutral-900/60">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <Skeleton className="mt-6 h-28 w-full rounded-xl bg-white/10" />
          <div className="mt-5 flex gap-3">
            <SkeletonButton className="h-11 w-32" />
            <SkeletonButton className="h-11 w-40" />
          </div>
        </CardSkeleton>
      </div>
    </DashboardLoader>
  )
}

function AdminTableSkeleton({
  label,
  columns,
  minWidth,
  columnWidths,
  tabs = false,
}: {
  label: string
  columns: number
  minWidth: string
  columnWidths: string[]
  tabs?: boolean
}) {
  return (
    <DashboardLoader label={label}>
      <div
        aria-hidden="true"
        className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-40 bg-white/10" />
            <Skeleton className="h-8 w-24 bg-white/10" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonBadge className="w-28" />
          <SkeletonButton className="h-8 w-24" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <FilterBarSkeleton />
        {tabs ? (
          <div aria-hidden="true" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((tab) => (
              <Skeleton key={tab} className="h-16 rounded-xl bg-white/10" />
            ))}
          </div>
        ) : null}

        <TableSkeleton
          columns={columns}
          rows={5}
          minWidth={minWidth}
          columnWidths={columnWidths}
        />
        <PaginationSkeleton />
      </div>
    </DashboardLoader>
  )
}

export function AdminUsersLoader() {
  return (
    <AdminTableSkeleton
      label="Loading users"
      columns={6}
      minWidth="min-w-[820px]"
      columnWidths={[
        "max-w-[12rem]",
        "max-w-[10rem]",
        "max-w-[5rem]",
        "max-w-[6rem]",
        "max-w-[8rem]",
        "max-w-[4rem]",
      ]}
    />
  )
}

export function AdminTuitionsLoader() {
  return (
    <AdminTableSkeleton
      label="Loading tuition approvals"
      columns={6}
      minWidth="min-w-[1080px]"
      columnWidths={[
        "max-w-[14rem]",
        "max-w-[10rem]",
        "max-w-[6rem]",
        "max-w-[6rem]",
        "max-w-[6rem]",
        "max-w-[8rem]",
      ]}
      tabs
    />
  )
}

export function AdminTransactionsLoader() {
  return (
    <AdminTableSkeleton
      label="Loading transactions"
      columns={7}
      minWidth="min-w-[1040px]"
      columnWidths={[
        "max-w-[12rem]",
        "max-w-[10rem]",
        "max-w-[5rem]",
        "max-w-[6rem]",
        "max-w-[6rem]",
        "max-w-[7rem]",
        "max-w-[8rem]",
      ]}
    />
  )
}
