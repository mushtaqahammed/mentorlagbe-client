import { Banner } from "@/components/home/banner"
import { FeaturedTuitions } from "@/components/home/FeaturedTuitions"
import { HowMentorLagbeWorks } from "@/components/home/HowMentorLagbeWorks"
import { PlatformStats } from "@/components/home/PlatformStats"
import { Pricing } from "@/components/home/Pricing"
import { TopSubjects } from "@/components/home/TopSubjects"

export const metadata = {
  title: "MentorLagbe | Find Your Ideal Tutor or Mentorship Batch Today",
  description:
    "Browse approved tuitions, connect with verified tutors, and track your learning journey on MentorLagbe.",
}

export default function HomePage() {
  return (
    <>
      <Banner />
      <FeaturedTuitions />
      <Pricing />
      <HowMentorLagbeWorks />
      <TopSubjects />
      <PlatformStats />
    </>
  )
}
