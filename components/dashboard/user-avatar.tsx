import { AvatarImage } from "@/components/profile/avatar-image"
import { cn } from "@/lib/utils"

export type DashboardUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

export function UserAvatar({
  user,
  className,
}: {
  user: DashboardUser
  className?: string
}) {
  const name = user.name || user.email || "User"

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400/15 text-xs font-semibold text-lime-300 ring-1 ring-lime-400/30",
        className
      )}
    >
      <AvatarImage
        src={user.image}
        name={name}
        className="size-full object-cover"
      />
    </span>
  )
}
