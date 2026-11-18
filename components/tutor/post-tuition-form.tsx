"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Crown,
  FileText,
  Globe2,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Laptop,
  MapPin,
  Sparkles,
  Trash2,
  Type,
  UploadCloud,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  CLASS_LEVEL_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  SUBJECT_OPTIONS,
  createTuition,
} from "@/lib/actions/tuition"

type FormValues = {
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
}

const INITIAL_VALUES: FormValues = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  description: "",
}

const MODE_CARDS: Array<{
  value: string
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    value: "Offline",
    icon: Home,
    title: "Offline",
    description: "Teach at a student's place",
  },
  {
    value: "Online",
    icon: Laptop,
    title: "Online",
    description: "Connect from anywhere",
  },
  {
    value: "Both",
    icon: Globe2,
    title: "Both",
    description: "Offer a flexible mix",
  },
]

const controlClasses =
  "h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 pl-10 pr-3 text-sm text-white shadow-sm transition-all outline-none placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
const selectClasses = cn(controlClasses, "appearance-none pr-10")
const labelClasses = "text-sm font-medium text-neutral-200"

function Field({
  id,
  label,
  icon: Icon,
  helper,
  className,
  children,
}: {
  id: string
  label: string
  icon: LucideIcon
  helper?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        />
        {children}
      </div>
      {helper ? (
        <p className="text-xs leading-relaxed text-neutral-500">{helper}</p>
      ) : null}
    </div>
  )
}

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-500"
      aria-hidden="true"
    />
  )
}

function PlanCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 sm:p-6">
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-neutral-300 ring-1 ring-white/10">
              <Sparkles className="size-4.5" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Free Plan
            </h2>
          </div>
          <p className="mt-3 text-sm text-neutral-400">
            Share your tuition requirements with students.
          </p>
        </div>

        <Button
          type="button"
          onClick={onUpgrade}
          className="h-10 shrink-0 gap-2 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
        >
          <Crown className="size-4" aria-hidden="true" />
          Upgrade to Pro
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}

export function PostTuitionForm() {
  const router = useRouter()

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => {
    const preview = previewRef
    return () => {
      if (preview.current) URL.revokeObjectURL(preview.current)
    }
  }, [])

  const clearImage = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setPreviewUrl(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleSelectedFile = useCallback((file: File) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const objectUrl = URL.createObjectURL(file)
    previewRef.current = objectUrl
    setPreviewUrl(objectUrl)
    setImageFile(file)
  }, [])

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleSelectedFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleSelectedFile(file)
  }

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { data: session, error } = await authClient.getSession()
    const token = session?.session.token

    if (error || !token) {
      console.error("Unable to retrieve authentication token", error)
      return
    }

    const result = await createTuition(
      {
        ...values,
        monthlyFee: Number(values.monthlyFee),
        daysPerWeek: Number(values.daysPerWeek),
        bannerImage: imageFile?.name ?? "",
      },
      token
    )
    console.log(result)
  }

  return (
    <div className="space-y-6">
      <PlanCard
        onUpgrade={() => router.push("/dashboard/profile#subscription")}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/70 shadow-2xl shadow-black/20"
      >
        <div className="border-b border-white/10 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <FileText className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">
                Tuition details
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Tell students exactly what you are looking for.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-6 p-5 sm:p-7 md:grid-cols-2">
          <Field
            id="title"
            label="Tuition Title"
            icon={Type}
            className="md:col-span-2"
          >
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Need an experienced Math tutor for Class 9"
              className={controlClasses}
            />
          </Field>

          <Field id="subject" label="Subject" icon={BookOpen}>
            <select
              id="subject"
              name="subject"
              value={values.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              className={selectClasses}
            >
              <option value="">Select a subject</option>
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <SelectChevron />
          </Field>

          <Field id="classLevel" label="Class Level" icon={GraduationCap}>
            <select
              id="classLevel"
              name="classLevel"
              value={values.classLevel}
              onChange={(event) =>
                updateField("classLevel", event.target.value)
              }
              className={selectClasses}
            >
              <option value="">Select a class level</option>
              {CLASS_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <SelectChevron />
          </Field>

          <div
            className="md:col-span-2"
            role="radiogroup"
            aria-labelledby="mode-label"
          >
            <p id="mode-label" className={labelClasses}>
              Tuition Mode
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {MODE_CARDS.map(({ value, icon: Icon, title, description }) => {
                const selected = values.mode === value
                return (
                  <label
                    key={value}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all focus-within:border-lime-400/60 focus-within:ring-4 focus-within:ring-lime-400/15 hover:-translate-y-0.5 hover:border-lime-400/40 hover:bg-lime-400/5 hover:shadow-lg hover:shadow-black/10",
                      selected
                        ? "border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/5"
                        : "border-white/10 bg-neutral-950/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={value}
                      checked={selected}
                      onChange={() => updateField("mode", value)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
                        selected
                          ? "bg-lime-400/15 text-lime-300 ring-lime-400/30"
                          : "bg-white/5 text-neutral-400 ring-white/10 group-hover:text-lime-300"
                      )}
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">
                        {title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                        {description}
                      </span>
                    </span>
                    {selected ? (
                      <CheckCircle2
                        className="ml-auto size-4 shrink-0 text-lime-400"
                        aria-hidden="true"
                      />
                    ) : null}
                  </label>
                )
              })}
            </div>
          </div>

          <Field id="location" label="Location" icon={MapPin}>
            <Input
              id="location"
              name="location"
              value={values.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Dhanmondi, Dhaka"
              className={controlClasses}
            />
          </Field>

          <Field
            id="monthlyFee"
            label="Monthly Fee"
            icon={Wallet}
            helper="Amount in Bangladeshi Taka (৳)."
          >
            <Input
              id="monthlyFee"
              name="monthlyFee"
              type="text"
              value={values.monthlyFee}
              onChange={(event) =>
                updateField("monthlyFee", event.target.value)
              }
              placeholder="৳ 5000"
              className={controlClasses}
            />
          </Field>

          <Field
            id="daysPerWeek"
            label="Days Per Week"
            icon={CalendarDays}
            helper="How many days per week can you teach?"
          >
            <select
              id="daysPerWeek"
              name="daysPerWeek"
              value={values.daysPerWeek}
              onChange={(event) =>
                updateField("daysPerWeek", event.target.value)
              }
              className={selectClasses}
            >
              <option value="">Select days per week</option>
              {DAYS_PER_WEEK_OPTIONS.map((day) => (
                <option key={day} value={day}>
                  {day} days per week
                </option>
              ))}
            </select>
            <SelectChevron />
          </Field>

          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <div className="relative mt-2">
              <FileText
                className="pointer-events-none absolute top-4 left-3.5 size-4.5 text-neutral-500"
                aria-hidden="true"
              />
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={5}
                placeholder="Mention your requirements, preferred teaching style, syllabus, and other details."
                className={cn(
                  controlClasses,
                  "h-auto min-h-32 resize-y py-3 leading-relaxed"
                )}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Mention your requirements, preferred teaching style, syllabus, and
              other details.
            </p>
          </div>

          <div className="md:col-span-2">
            <p id="banner-label" className={labelClasses}>
              Banner Image
            </p>

            <input
              ref={fileInputRef}
              id="bannerImage"
              type="file"
              onChange={handleFileInput}
              className="sr-only"
              aria-labelledby="banner-label"
            />

            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-neutral-950/60">
                <div className="relative aspect-[16/7] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Selected tuition banner preview"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-3">
                  <p className="min-w-0 truncate text-xs text-neutral-400">
                    {imageFile?.name || "Selected banner"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      className="h-8 gap-1.5 rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 text-xs text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={handleDrop}
                className={cn(
                  "mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-10 text-center transition-all",
                  isDragging
                    ? "border-lime-400/70 bg-lime-400/10"
                    : "border-white/15 bg-neutral-950/40 hover:border-lime-400/40 hover:bg-lime-400/5"
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
                  <UploadCloud className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-semibold text-white">
                  Drag and drop your banner image here
                </p>
                <p className="mt-1.5 text-xs text-neutral-500">
                  Add an image that represents your tuition.
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 h-9 gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
                >
                  <ImageIcon className="size-4" aria-hidden="true" />
                  Browse files
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs text-neutral-500">
            New posts stay pending until an admin reviews and approves them.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/tutor/my-tuitions")}
              className="h-11 rounded-xl border-white/15 bg-transparent px-5 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl border-transparent bg-lime-400 px-6 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
