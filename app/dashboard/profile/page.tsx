import { DashboardPage } from "@/components/dashboard/dashboard-page"

export default function ProfilePage() {
  return (
    <DashboardPage
      title="My Profile"
      description="Manage your personal details and review your current subscription."
    >
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section
          id="profile"
          className="rounded-xl border border-white/10 bg-neutral-950/60 p-5"
        >
          <h2 className="text-sm font-semibold text-white">Profile details</h2>
          <p className="mt-1.5 text-sm text-neutral-400">
            Your account information will appear here.
          </p>
        </section>
        <section
          id="subscription"
          className="rounded-xl border border-white/10 bg-neutral-950/60 p-5"
        >
          <h2 className="text-sm font-semibold text-white">Subscription</h2>
          <p className="mt-1.5 text-sm text-neutral-400">
            Your current plan and billing details will appear here.
          </p>
        </section>
      </div>
    </DashboardPage>
  )
}
