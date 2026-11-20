"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  UserRound,
  LogOut,
  ChevronRight,
} from "lucide-react"

import { authClient, signOut } from "@/lib/auth-client"
import { notify, userMessage } from "@/lib/notify"
import { Logo } from "@/components/logo"
import { AvatarImage } from "@/components/profile/avatar-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
]

const roleBadgeStyles: Record<string, string> = {
  Student: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  Tutor: "bg-lime-400/10 text-lime-300 border-lime-400/20",
  Admin: "bg-rose-400/10 text-rose-300 border-rose-400/20",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        roleBadgeStyles[role] ?? roleBadgeStyles.Student
      )}
    >
      {role}
    </span>
  )
}

function UserAvatar({ image, name }: { image?: string | null; name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-800 text-xs font-bold text-white ring-2 ring-white/5">
      <AvatarImage
        src={image}
        name={name}
        className="size-full object-cover"
      />
    </span>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const role = user?.role ?? "Student"

  async function handleSignOut() {
    try {
      setIsSigningOut(true)

      const { error: signOutError } = await signOut()
      if (signOutError) {
        throw new Error(signOutError.message ?? "Could not log out.")
      }

      setMobileOpen(false)
      notify.success("Logged out successfully!")
      router.push("/")
      router.refresh()
    } catch (error) {
      notify.error("Could not log out", userMessage(error))
    } finally {
      setIsSigningOut(false)
    }
  }

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  const accountLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Update Profile" },
  ]

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-neutral-950/90 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300",
                  active
                    ? "bg-lime-400 text-neutral-950 shadow-sm shadow-lime-400/20"
                    : "text-neutral-400 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop User Section */}
        <div className="hidden items-center gap-4 md:flex">
          {isPending ? (
            <div className="flex items-center gap-3">
              <span className="size-9 animate-pulse rounded-full bg-neutral-800" />
              <span className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
            </div>
          ) : user ? (
            <>
              {/* User Profile */}
              <div className="flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] py-1.5 pr-3 pl-1.5">
                <UserAvatar image={user.image} name={user.name} />

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="max-w-28 truncate text-xs font-semibold text-white">
                    {user.name}
                  </span>
                  <RoleBadge role={role} />
                </div>
              </div>

              {/* Account Links */}
              <div className="flex items-center gap-4">
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive(link.href)
                        ? "text-lime-400"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Sign Out */}
              <Button
                variant="outline"
                size="sm"
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="h-9 rounded-full border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-neutral-300 transition-all hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
              >
                <LogOut className="mr-2 size-3.5" />
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-bold text-neutral-950 shadow-md shadow-lime-400/10 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-400/20"
              >
                Get Started
                <ChevronRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-neutral-950 px-4 pt-4 pb-6 shadow-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {/* Navigation Links */}
            {navLinks.map((link) => {
              const active = isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-lime-400 text-neutral-950"
                      : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {link.label}
                  {active && <ChevronRight className="size-4" />}
                </Link>
              )
            })}

            {/* Account Section */}
            <div className="mt-4 border-t border-white/[0.08] pt-4">
              {isPending ? (
                <p className="px-3 py-2 text-sm text-neutral-400">
                  Loading account...
                </p>
              ) : user ? (
                <div className="flex flex-col gap-3">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                    <UserAvatar image={user.image} name={user.name} />

                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-semibold text-white">
                        {user.name}
                      </span>
                      <RoleBadge role={role} />
                    </div>
                  </div>

                  {/* Account Navigation */}
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                        isActive(link.href)
                          ? "bg-white/[0.08] text-lime-400"
                          : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      {link.href === "/dashboard" ? (
                        <LayoutDashboard className="size-4" />
                      ) : (
                        <UserRound className="size-4" />
                      )}
                      {link.label}
                    </Link>
                  ))}

                  <Button
                    variant="outline"
                    disabled={isSigningOut}
                    onClick={handleSignOut}
                    className="mt-1 h-11 w-full rounded-xl border-rose-400/20 bg-rose-400/[0.06] text-sm font-semibold text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    <LogOut className="mr-2 size-4" />
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/sign-in"
                    onClick={closeMobileMenu}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    onClick={closeMobileMenu}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-400 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300"
                  >
                    Get Started
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
