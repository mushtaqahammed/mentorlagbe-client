"use client"

import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react"

import { LogoMark } from "@/components/logo"
import { cn } from "@/lib/utils"

/* ---------------------------------- icons --------------------------------- */

function FieldIcon({ name }: { name: "mail" | "lock" | "user" }) {
  const paths: Record<string, ReactNode> = {
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m2 7 8.4 5.6a2 2 0 0 0 2.2 0L21 7" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-neutral-500"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7c2 0 3.7.7 5.1 1.6M22 12s-3.5 7-10 7c-2 0-3.7-.7-5.1-1.6" />
          <path d="m3 3 18 18" />
        </>
      )}
    </svg>
  )
}

/* ---------------------------------- shell --------------------------------- */

const brandFeatures = [
  "Browse verified tuition posts",
  "Connect with students instantly",
  "Track your sessions in one place",
]

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string
  subtitle: string
  /** Rendered below the form container, e.g. "Don't have an account?" links */
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] bg-neutral-950 text-white lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-white/10 xl:p-14">
        <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-lime-400/20 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-lime-400/10 blur-[100px]" />

        <div className="relative flex items-center gap-2.5">
          <LogoMark className="size-8 shrink-0 -rotate-6" />
          <span className="text-xl font-bold tracking-tight">MentorLagbe</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <h2 className="max-w-sm text-4xl leading-tight font-bold tracking-tight">
            Find the right mentor,{" "}
            <span className="text-lime-400">right when you need one.</span>
          </h2>
          <ul className="flex flex-col gap-4 text-sm text-neutral-300">
            {brandFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-lime-400/15 ring-1 ring-lime-400/40">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3 text-lime-400"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-neutral-600">
          © {new Date().getFullYear()} MentorLagbe. All rights reserved.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Compact brand row (mobile) */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <LogoMark className="size-6 shrink-0 -rotate-6" />
          <span className="text-lg font-bold tracking-tight">MentorLagbe</span>
        </div>

        <div className="w-full max-w-md">
          <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        {/* Below the form container */}
        {footer && (
          <div className="mt-8 w-full max-w-md">{footer}</div>
        )}
      </section>
    </main>
  )
}

/* ---------------------------------- fields -------------------------------- */

const inputClasses =
  "h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm text-white transition-[border-color,box-shadow] outline-none placeholder:text-neutral-500 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"

export function AuthInput({
  label,
  id,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  icon?: "mail" | "lock" | "user"
}) {
  const [visible, setVisible] = useState(false)
  const isPassword = props.type === "password"

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-200">
        {label}
      </label>
      <div className="relative">
        {icon && <FieldIcon name={icon} />}
        <input
          id={id}
          type={isPassword && visible ? "text" : props.type}
          {...props}
          className={cn(
            inputClasses,
            icon && "pl-11",
            isPassword ? "pr-11" : "pr-4"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
    </div>
  )
}

export function AuthSelect({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  id: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-200">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={cn(inputClasses, "bg-neutral-900 pr-8")}
      >
        {children}
      </select>
    </div>
  )
}

export function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-lime-400 text-sm font-bold text-neutral-950 shadow-sm transition-all hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-400/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  )
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-transparent text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
    >
      <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
        />
      </svg>
      Continue with Google
    </button>
  )
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-medium tracking-wide text-neutral-500 uppercase">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  )
}
