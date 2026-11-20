import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { SiteChrome } from "@/components/site-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { AppToastContainer } from "@/components/ui/toast-container"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
          <SiteChrome>{children}</SiteChrome>
          <AppToastContainer />
        </ThemeProvider>
      </body>
    </html>
  )
}
