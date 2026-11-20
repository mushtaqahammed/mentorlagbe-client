"use client"

import { createElement, type ReactNode } from "react"
import { toast, type ToastOptions, type UpdateOptions } from "react-toastify"

type NotifyOptions = Omit<ToastOptions, "type"> & {
  /** Optional secondary line, rendered beneath the toast title. */
  description?: ReactNode
}

/** Callers may pass either a description string or a full options object. */
type NotifyInput = NotifyOptions | string

type PromiseMessages<T> = {
  loading: ReactNode
  success: ReactNode | ((data: T) => ReactNode | string)
  error: ReactNode | ((error: unknown) => ReactNode | string)
  description?: ReactNode
  duration?: number
  id?: string | number
}

/**
 * Single entry point for every user-facing notification in the app.
 * All toasts share one React-Toastify <ToastContainer /> in the root layout.
 */
export const notify = {
  success: (title: ReactNode, options?: NotifyInput) =>
    toast.success(content(title, options), optionsFor(options)),

  error: (title: ReactNode, options?: NotifyInput) =>
    toast.error(content(title, options), optionsFor(options)),

  warning: (title: ReactNode, options?: NotifyInput) =>
    toast.warning(content(title, options), optionsFor(options)),

  info: (title: ReactNode, options?: NotifyInput) =>
    toast.info(content(title, options), optionsFor(options)),

  loading: (title: ReactNode, options?: NotifyInput) =>
    toast.loading(content(title, options), optionsFor(options)),

  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    messages: PromiseMessages<T>
  ) =>
    toast.promise(
      promise,
      {
        pending: renderMessage(messages.loading, messages.description),
        success: renderMessage(messages.success, messages.description),
        error: renderMessage(messages.error, messages.description),
      },
      {
        ...(messages.duration ? { autoClose: messages.duration } : {}),
        ...(messages.id ? { toastId: messages.id } : {}),
      }
    ),

  dismiss: (id?: string | number) =>
    id === undefined ? toast.dismiss() : toast.dismiss(id),
}

/** Build the visible toast body: title plus an optional description line. */
function content(title: ReactNode, options?: NotifyInput): ReactNode {
  const description =
    typeof options === "string"
      ? options
      : options?.description

  if (description === undefined) return title

  return createElement(
    "div",
    { className: "flex flex-col gap-1" },
    createElement("div", null, title),
    createElement(
      "div",
      { className: "text-xs leading-relaxed opacity-75" },
      description
    )
  )
}

function optionsFor(options?: NotifyInput): ToastOptions | undefined {
  const resolved = normalize(options)
  if (!resolved) return undefined

  // `description` is rendered into the toast body by content(); every other
  // option is passed straight through to react-toastify.
  const { description, ...rest } = resolved
  void description
  return { autoClose: 4000, ...rest }
}

function normalize(options?: NotifyInput): NotifyOptions | undefined {
  if (options === undefined) return undefined
  return typeof options === "string" ? { description: options } : options
}

/** Turn a message value or callback into a react-toastify render function. */
function renderMessage<T>(
  message: ReactNode | ((data: T) => ReactNode | string),
  description?: ReactNode
): UpdateOptions<T> {
  return {
    render: (result) => {
      const value =
        typeof message === "function"
          ? (message as (data: T) => ReactNode | string)(result.data as T)
          : message
      return content(value, description === undefined ? undefined : { description })
    },
  }
}

/**
 * Turns an unknown thrown value into a short, user-safe message.
 * Detailed API messages are allowed; stack traces, URLs and generic network
 * noise fall back to a friendly message instead of being shown to the user.
 */
export function userMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (!(error instanceof Error)) return fallback

  const message = error.message.trim()
  if (!message || message.length > 140) return fallback

  const looksTechnical =
    /^(fetch|network|typeerror|referenceerror|syntaxerror)/i.test(message) ||
    message.includes("http://") ||
    message.includes("https://") ||
    message.includes("\n")
  if (looksTechnical) return fallback

  return message
}
