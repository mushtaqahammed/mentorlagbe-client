"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { authClient, signOut } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  

]

const roleBadgeStyles: Record<string, string> = {
  Student: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  Tutor: "bg-lime-400/15 text-lime-300 ring-lime-400/30",
  Admin: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        roleBadgeStyles[role] ?? roleBadgeStyles.Student
      )}
    >
      {role}
    </span>
  )
}

function UserAvatar({ image, name }: { image?: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-xs font-semibold text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="size-full object-cover" />
      ) : (
        initials || "U"
      )}
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

      await signOut()

      setMobileOpen(false)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 text-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation (lg+ — below lg the nav links live in the menu) */}
        <div className="hidden items-center gap-4 xl:gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm whitespace-nowrap transition-colors",
                pathname === link.href
                  ? "font-medium text-white"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop User Section */}
        <div className="hidden items-center gap-3 md:flex xl:gap-6">
          {isPending ? (
            <span className="size-8 animate-pulse rounded-full bg-neutral-700" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2.5">
                <UserAvatar image={user.image} name={user.name} />

                <div className="flex flex-col leading-tight">
                  <span className="max-w-24 truncate text-sm font-medium xl:max-w-32">
                    {user.name}
                  </span>
                  <RoleBadge role={role} />
                </div>
              </div>

              {/* Dashboard + Update Profile links */}
              <div className="flex items-center gap-3 xl:gap-5">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/update-profile", label: "Update Profile" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm whitespace-nowrap transition-colors",
                      pathname === link.href
                        ? "font-medium text-white"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-neutral-300 hover:text-white"
              >
                Sign In
              </Link>

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

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 lg:hidden"
        >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-neutral-800 px-4 pt-3 pb-5 lg:hidden">
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
            {isPending ? (
              <p className="text-sm text-neutral-400">Loading...</p>
            ) : user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar image={user.image} name={user.name} />

                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{user.name}</span>
                    <RoleBadge role={role} />
                  </div>
                </div>

                {/* Dashboard + Update Profile links */}
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/update-profile", label: "Update Profile" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

                <Button
                  variant="outline"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                  className="rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
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
