import { Banner } from "@/components/home/banner"
import { FeaturedTuitions } from "@/components/home/FeaturedTuitions"
import { HowMentorLagbeWorks } from "@/components/home/HowMentorLagbeWorks"
import { PlatformStats } from "@/components/home/PlatformStats"
import { Testimonials } from "@/components/home/Testimonials"
import { TopSubjects } from "@/components/home/TopSubjects"

export default function HomePage() {
  return (
    <>
      <Banner />
      <TopSubjects />
      <HowMentorLagbeWorks />
      <PlatformStats />
      <FeaturedTuitions />
      <Testimonials />
    </>
  )
}
