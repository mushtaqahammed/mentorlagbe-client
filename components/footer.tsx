import Link from "next/link"

import { LogoMark } from "@/components/logo"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
]

const contactInfo = [
  {
    label: "support@mentorlagbe.com",
    href: "mailto:support@mentorlagbe.com",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m2 7 8.4 5.6a2 2 0 0 0 2.2 0L21 7" />
      </>
    ),
  },
  {
    label: "+880 1700-000000",
    href: "tel:+8801700000000",
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    label: "Dhaka, Bangladesh",
    href: null,
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
]

const socialLinks = [
  {
    label: "X",
    href: "https://x.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM6.767 20.452H3.907V9h2.86v11.452Z",
  },
]

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

const footerLink =
  "w-fit text-sm text-neutral-400 transition-colors hover:text-lime-400"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-neutral-950">
      {/* Soft lime glow from the top, matching the auth brand panels */}
      <div className="pointer-events-none absolute -top-44 left-1/2 size-130 -translate-x-1/2 rounded-full bg-lime-400/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* CTA banner */}
        <div className="mt-6 flex flex-col gap-6 rounded-[2rem] bg-lime-400 p-8 text-neutral-950 ring-1 ring-lime-300/50 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to find the right mentor?
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-neutral-800">
              Join MentorLagbe for free and connect with verified tutors today.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-950/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/30"
          >
            Get Started
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.3fr_1fr]">
          {/* Brand block: logo, tagline, social links */}
          <div className="flex flex-col items-start gap-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-9 shrink-0 -rotate-6" />
              <span className="text-2xl font-bold tracking-tight text-white">
                MentorLagbe
              </span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              Find the right mentor, right when you need one. Connecting
              students and tutors across Bangladesh.
            </p>

            {/* Social media (new X logo) */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-lime-400 hover:bg-lime-400 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links">
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Contact">
            <ul className="flex flex-col gap-3.5">
              {contactInfo.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 text-lime-400"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </svg>
                  </span>
                  {item.href ? (
                    <a href={item.href} className={footerLink}>
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm text-neutral-400">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Legal">
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/" className={footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className={footerLink}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </FooterColumn>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-sm text-neutral-500 sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </span>
          <span className="font-medium text-neutral-400">
            Mentors · Learners · Growth
          </span>
        </div>

        {/* Giant wordmark — signature element from the reference design */}
        <div
          aria-hidden="true"
          className="pointer-events-none -mb-4 flex justify-center overflow-hidden select-none sm:-mb-7 lg:-mb-10"
        >
          <span className="bg-gradient-to-b from-white/10 to-white/[0.02] bg-clip-text text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] font-black tracking-tighter text-transparent">
            MentorLagbe
          </span>
        </div>
      </div>
    </footer>
  )
}
