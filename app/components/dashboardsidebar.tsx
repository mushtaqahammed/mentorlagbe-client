"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { LogoMark } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import {
  dashboardHomeByRole,
  getDashboardMenu,
  isDashboardMenuItemActive,
  normalizeDashboardRole,
} from "@/lib/dashboard-menu"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isMobile, setOpenMobile } = useSidebar()

  const role = normalizeDashboardRole(session?.user?.role)
  const menuItems = getDashboardMenu(role)

  function closeDrawer() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Also close the drawer when navigation happens outside a menu item.
  useEffect(() => {
    closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile])

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-neutral-900"
    >
      <div className="flex h-full w-full flex-col bg-neutral-900 text-white">
        <SidebarHeader className="gap-1 border-b border-white/10 px-2 py-4 group-data-[collapsible=icon]:px-0">
          <Link
            href={dashboardHomeByRole[role]}
            onClick={closeDrawer}
            className="flex h-9 items-center gap-2.5 rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <LogoMark className="size-7 shrink-0 -rotate-6" />
            <span className="truncate text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
              MentorLagbe
            </span>
          </Link>
          <span className="px-1 text-[11px] font-medium tracking-wide text-neutral-500 uppercase group-data-[collapsible=icon]:hidden">
            {role} workspace
          </span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase group-data-[collapsible=icon]:hidden">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {menuItems.map((item) => {
                  const isActive = isDashboardMenuItemActive(item, pathname)
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={
                          <Link
                            href={item.href}
                            onClick={closeDrawer}
                            title={item.label}
                          />
                        }
                        className={cn(
                          "h-10 gap-3 rounded-lg px-3 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
                          "data-[active=true]:bg-lime-400/15 data-[active=true]:font-semibold data-[active=true]:text-lime-300 data-[active=true]:ring-1 data-[active=true]:ring-lime-400/30"
                        )}
                      >
                        <Icon
                          className="size-4.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="ml-auto size-1.5 shrink-0 rounded-full bg-lime-400 group-data-[collapsible=icon]:hidden"
                          />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/10 px-3 py-3">
          <p className="text-[11px] text-neutral-500 group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} MentorLagbe
          </p>
        </SidebarFooter>

        <SidebarRail />
      </div>
    </Sidebar>
  )
}
