export type TestimonialRole = "student" | "tutor"
export type TestimonialStatus = "pending" | "approved" | "rejected"

/** Public shape — never includes userId, email, or moderation details. */
export type Testimonial = {
  id: string
  name: string
  role: TestimonialRole
  rating: number
  message: string
  image: string | null
  /** Derived from the live user record, never from submitted data. */
  verified: boolean
  createdAt: string
}

export type TestimonialsResponse = {
  testimonials: Testimonial[]
  total: number
  updatedAt: string
}

export type AdminTestimonial = Testimonial & {
  userId: string
  status: TestimonialStatus
  updatedAt: string
}

export type AdminTestimonialsResponse = {
  testimonials: AdminTestimonial[]
  total: number
  updatedAt: string
}

export const TESTIMONIAL_MIN_LENGTH = 10
export const TESTIMONIAL_MAX_LENGTH = 600
export const TESTIMONIALS_LIMIT = 12
