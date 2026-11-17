"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { signOut, useSession } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
] as const

const roleBadgeStyles: Record<string, string> = {
  Student: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  Tutor: "bg-lime-400/15 text-lime-300 ring-lime-400/30",
  Admin: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] leading-none font-semibold ring-1",
        roleBadgeStyles[role] ?? roleBadgeStyles.Student
      )}
    >
      {role}
    </span>
  )
}

function UserAvatar({
  image,
  name,
  className,
}: {
  image?: string | null
  name: string
  className?: string
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-xs font-semibold text-white",
        className
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="size-full object-cover" />
      ) : (
        initials || "U"
      )}
    </span>
  )
}

function NavLink({
  href,
  label,
  active,
  onClick,
  className,
}: {
  href: string
  label: string
  active: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm whitespace-nowrap transition-colors",
        active ? "font-medium text-white" : "text-neutral-400 hover:text-white",
        className
      )}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // `data` is the full session payload: { user, session }
  const { data, isPending } = useSession()
  const user = data?.user
  const role = (user as { role?: string } | undefined)?.role ?? "Student"

  async function handleSignOut() {
    setMobileOpen(false)
    // Shared store: `useSession` above updates automatically after this.
    await signOut()
    router.push("/")
    router.refresh()
  }

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 text-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Logo & Brand Name */}
        <Logo />

        {/* Public navigation items (desktop) */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={pathname === link.href}
            />
          ))}
        </div>

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-6 md:flex">
          {isPending ? (
            <span className="size-8 animate-pulse rounded-full bg-neutral-700" />
          ) : user ? (
            <>
              {/* Avatar + Name & Role Badge */}
              <div className="flex items-center gap-2.5">
                <UserAvatar image={user.image} name={user.name} />
                <div className="flex flex-col items-start leading-tight">
                  <span className="max-w-32 truncate text-sm font-medium">
                    {user.name}
                  </span>
                  <RoleBadge role={role} />
                </div>
              </div>

             

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              {/* Unauthenticated: Sign In / Sign Up */}
              <NavLink href="/sign-in" label="Sign In" active={false} />
              <Button
                size="sm"
                onClick={() => router.push("/sign-up")}
                className="rounded-full bg-lime-400 font-semibold text-neutral-950 hover:bg-lime-300"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex size-9 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white md:hidden"
        >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-neutral-800 px-4 pt-3 pb-5 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  pathname === link.href
                    ? "bg-neutral-800 font-medium text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-800 pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar image={user.image} name={user.name} />
                  <div className="flex flex-col leading-tight">
                    <span className="truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <RoleBadge role={role} />
                  </div>
                </div>
            
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/sign-in"
                  onClick={closeMobileMenu}
                  className="px-3 text-sm text-neutral-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Button
                  onClick={() => {
                    closeMobileMenu()
                    router.push("/sign-up")
                  }}
                  className="rounded-full bg-lime-400 font-semibold text-neutral-950 hover:bg-lime-300"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
