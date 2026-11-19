import { Banner } from "@/components/home/banner"
import { FeaturedTuitions } from "@/components/home/FeaturedTuitions"
import { HowMentorLagbeWorks } from "@/components/home/HowMentorLagbeWorks"

export default function HomePage() {
  return (
    <>
      <Banner />
      <HowMentorLagbeWorks />
      <FeaturedTuitions />
    </>
  )
}
