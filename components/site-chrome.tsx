"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

/**
 * Keeps the public site header/footer on marketing and auth pages while
 * letting /dashboard render its own app shell instead of a second navbar.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  )
}
