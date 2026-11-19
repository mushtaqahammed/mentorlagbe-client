import { PaymentAccessGate } from "@/components/payment/payment-access-gate"
import { PaymentCheckout } from "@/components/payment/payment-checkout"
import { getPlanForRole } from "@/lib/plans"
import { getRequestSession } from "@/lib/session"

export const metadata = {
  title: "Payment | MentorLagbe",
  description: "Review your MentorLagbe Pro plan and payment details.",
}

export default async function PaymentPage() {
  const session = await getRequestSession()
  const user = session?.user

  if (!user) {
    return <PaymentAccessGate reason="sign-in" />
  }

  // The plan is derived from the authenticated role, never from the URL.
  const plan = getPlanForRole(user.role)

  if (!plan) {
    return <PaymentAccessGate reason="role" />
  }

  return (
    <PaymentCheckout
      plan={plan}
      user={{ name: user.name, email: user.email }}
    />
  )
}
