import { Globe, LineChart, Users } from "lucide-react"
import { FeatureCard } from "@/components/feature-card"

/**
 * Features section component for the landing page
 */
export function FeaturesSection() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-british-navy" />,
      title: "Buyer Directory",
      description:
        "Access detailed profiles of 1,000+ corporate carbon credit buyers, with filtering by industry, volume, and project preferences.",
    },
    {
      icon: <LineChart className="h-10 w-10 text-british-navy" />,
      title: "Market Analytics",
      description:
        "Track pricing trends, volume data, and market movements with our interactive dashboards and custom reports.",
    },
    {
      icon: <Globe className="h-10 w-10 text-british-navy" />,
      title: "News Feed",
      description:
        "Stay informed with curated RSS feeds covering carbon market news, policy updates, and industry developments.",
    },
  ]

  return (
    <section id="features" className="container py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-british-navy">
          The Ultimate Carbon Market Intelligence Platform
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Gain unprecedented access to the voluntary carbon market with our comprehensive buyer directory, real-time
          market insights, and powerful networking tools.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 mt-12">
        {features.map((feature, index) => (
          <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
        ))}
      </div>
    </section>
  )
}

