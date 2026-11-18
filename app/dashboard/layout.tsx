import { DashboardGuard } from "@/components/dashboard/dashboard-guard"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DashboardSidebar } from "../components/dashboardsidebar"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="bg-neutral-950">
      <DashboardGuard>
        <DashboardSidebar />
        <SidebarInset className="bg-neutral-950 text-white">
          <DashboardNavbar />
          <div className="min-h-[calc(100svh-4rem)] flex-1">{children}</div>
        </SidebarInset>
      </DashboardGuard>
    </SidebarProvider>
  )
}

export default DashboardLayout
