"use client"

import { useState } from "react"

/** Renders a user's picture, falling back to initials when it is missing or broken. */
export function AvatarImage({
  src,
  name,
  className,
}: {
  src?: string | null
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"

  if (!src || failed) return <>{initials}</>

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
