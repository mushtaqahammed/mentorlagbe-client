"use client"

import { Menu } from "@base-ui/react/menu"
import { ChevronDown, LogOut, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { RoleBadge } from "@/components/dashboard/role-badge"
import { UserAvatar, type DashboardUser } from "@/components/dashboard/user-avatar"
import { signOut } from "@/lib/auth-client"

const menuItemClass =
  "flex w-full cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 outline-none select-none data-highlighted:bg-white/5 data-highlighted:text-white"

export function ProfileDropdown({ user }: { user: DashboardUser }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const name = user.name || user.email || "User"

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      await signOut()
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full p-1 text-white outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-lime-400/60 data-[popup-open]:bg-white/5"
      >
        <UserAvatar user={user} className="size-8" />
        <span className="hidden max-w-28 truncate text-sm font-medium sm:block lg:max-w-32">
          {name}
        </span>
        <ChevronDown className="hidden size-4 text-neutral-400 sm:block" aria-hidden="true" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={10} className="z-50 outline-hidden">
          <Menu.Popup className="w-64 origin-[var(--transform-origin)] rounded-2xl border border-white/10 bg-neutral-900 p-2 text-white shadow-2xl shadow-black/40 outline-hidden transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="flex items-center gap-3 px-2 py-2.5">
              <UserAvatar user={user} className="size-10" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold">{name}</span>
                {user.email && (
                  <span className="truncate text-xs text-neutral-400">
                    {user.email}
                  </span>
                )}
                <RoleBadge role={user.role} />
              </div>
            </div>

            <Menu.Separator className="my-1 h-px bg-white/10" />

            <Menu.Item
              onClick={() => router.push("/dashboard/profile")}
              className={menuItemClass}
            >
              <UserRound className="size-4 text-neutral-400" aria-hidden="true" />
              My Profile
            </Menu.Item>

            <Menu.Item
              disabled={isSigningOut}
              onClick={handleSignOut}
              className={menuItemClass}
            >
              <LogOut className="size-4 text-neutral-400" aria-hidden="true" />
              {isSigningOut ? "Logging out..." : "Logout"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
