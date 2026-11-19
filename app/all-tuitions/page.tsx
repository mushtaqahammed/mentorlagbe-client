import { redirect } from "next/navigation"

/**
 * The public browse page lives at `/tuitions`. This alias keeps the homepage's
 * "See All Tuitions" link stable without duplicating the listing UI.
 */
export default function AllTuitionsPage() {
  redirect("/tuitions")
}
