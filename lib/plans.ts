export type PlanId = "pro-tutor" | "pro-student"

export type ProPlan = {
  id: PlanId
  name: string
  audience: string
  price: number
  billingPeriod: string
  description: string
  benefits: string[]
  accent: "lime" | "sky"
}

/**
 * Single source of truth for the Pro plans shown on /pricing and /payment.
 * Prices are in USD per month.
 */
export const proPlans: Record<PlanId, ProPlan> = {
  "pro-tutor": {
    id: "pro-tutor",
    name: "Pro Tutor",
    audience: "For tutors",
    price: 15,
    billingPeriod: "Monthly",
    description:
      "Grow your tutoring business with more visibility and tools to manage your listings.",
    benefits: [
      "Unlimited tuition posts",
      "Priority placement in search results",
      "Unlimited student applications",
      "Profile performance insights",
    ],
    accent: "lime",
  },
  "pro-student": {
    id: "pro-student",
    name: "Pro Student",
    audience: "For students",
    price: 10,
    billingPeriod: "Monthly",
    description:
      "Find the right mentor faster and keep your learning journey organized.",
    benefits: [
      "Unlimited tuition applications",
      "Priority consideration from tutors",
      "Save tutors and tuition posts",
      "Learning progress reminders",
    ],
    accent: "sky",
  },
}

export const planList = [proPlans["pro-tutor"], proPlans["pro-student"]]

/**
 * The checkout plan is derived from the authenticated role only. Query params
 * are intentionally ignored so a user cannot request another role's plan.
 */
export function getPlanForRole(role?: string | null): ProPlan | null {
  if (role === "Tutor") return proPlans["pro-tutor"]
  if (role === "Student") return proPlans["pro-student"]
  return null
}

export function formatPlanPrice(price: number) {
  return `$${price}`
}
