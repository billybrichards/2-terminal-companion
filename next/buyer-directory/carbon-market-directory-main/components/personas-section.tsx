"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Type definition for persona data
 */
type Persona = {
  id: string
  title: string
  description: string
  benefits: string[]
}

/**
 * Personas section component for the landing page
 * Client component to handle tab interactions
 */
export function PersonasSection() {
  const [activeTab, setActiveTab] = useState("developers")

  const personas: Persona[] = [
    {
      id: "developers",
      title: "For Carbon Project Developers",
      description:
        "Find qualified buyers for your carbon credits and shorten your sales cycle. Access 1,000+ corporate buyers actively looking for credits like yours.",
      benefits: [
        "Filter buyers by project type preference, industry, and purchase volume",
        "Get contact information for key decision-makers",
        "Track market trends to optimize your pricing strategy",
      ],
    },
    {
      id: "brokers",
      title: "For Carbon Market Brokers & Traders",
      description:
        "Stay ahead of the market with comprehensive data on buyers, sellers, and pricing trends. Identify new opportunities and gain a competitive edge.",
      benefits: [
        "Track new market entrants and changing buyer preferences",
        "Access pricing data and volume trends across different project types",
        "Match retirements to actual corporate buyers for better market intelligence",
      ],
    },
    {
      id: "consultants",
      title: "For Sustainability Consultants",
      description:
        "Save research time and enhance your expertise with comprehensive market data. Provide clients with data-backed recommendations and insights.",
      benefits: [
        "Benchmark clients against industry peers with detailed market data",
        "Generate custom reports for client presentations",
        "Access historical trends to support strategic recommendations",
      ],
    },
    {
      id: "corporates",
      title: "For Corporate Sustainability Managers",
      description:
        "Benchmark your carbon strategy against peers and identify potential partners. Make informed decisions about your offset procurement strategy.",
      benefits: [
        "Compare your offset strategy with industry peers",
        "Identify high-quality projects based on who else is buying",
        "Find potential partners for collective purchasing agreements",
      ],
    },
  ]

  return (
    <section id="personas" className="container py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Tailored for Carbon Market Professionals
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Whether you're selling credits, brokering deals, advising clients, or managing corporate sustainability,
          CarbonConnect delivers the insights you need.
        </p>
      </div>

      <Tabs
        defaultValue="developers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-12 w-full max-w-4xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-4">
          {personas.map((persona) => (
            <TabsTrigger key={persona.id} value={persona.id}>
              {persona.id === "developers"
                ? "Project Developers"
                : persona.id === "brokers"
                  ? "Brokers & Traders"
                  : persona.id === "consultants"
                    ? "Consultants"
                    : "Corporate Buyers"}
            </TabsTrigger>
          ))}
        </TabsList>

        {personas.map((persona) => (
          <TabsContent key={persona.id} value={persona.id} className="p-6 border rounded-lg mt-6">
            <h3 className="text-xl font-bold mb-2">{persona.title}</h3>
            <p className="mb-4">{persona.description}</p>
            <ul className="space-y-2">
              {persona.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

