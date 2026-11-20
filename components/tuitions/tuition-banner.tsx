"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"

/** Banner image for a tuition card, with a themed fallback when unavailable. */
export function TuitionBanner({
  src,
  alt,
  subject,
}: {
  src?: string | null
  alt: string
  subject?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="relative mb-4 aspect-[16/8] w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950/60">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src!}
          alt={alt}
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.12),transparent_55%)] text-lime-300/70">
          <BookOpen className="size-7" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">
            {subject || "Tuition"}
          </span>
        </div>
      )}
    </div>
  )
}
