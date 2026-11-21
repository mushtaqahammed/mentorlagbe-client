import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { SessionHydrator } from "@/components/auth/session-hydrator"
import { BookmarkProvider } from "@/components/bookmarks/bookmark-provider"
import { SiteChrome } from "@/components/site-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { AppToastContainer } from "@/components/ui/toast-container"
import { getRequestSession } from "@/lib/session"
import { cn } from "@/lib/utils"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getRequestSession().catch(() => null)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geist.variable, geistMono.variable, "antialiased")}
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionHydrator session={session} />
          <BookmarkProvider>
            <SiteChrome>{children}</SiteChrome>
            <AppToastContainer />
          </BookmarkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
