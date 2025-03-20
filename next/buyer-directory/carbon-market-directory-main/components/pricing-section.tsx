import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Type definition for pricing plan data
 */
type PricingPlan = {
  title: string
  description: string
  price: string
  features: string[]
  isPrimary?: boolean
}

/**
 * Pricing section component for the landing page
 */
export function PricingSection() {
  const pricingPlans: PricingPlan[] = [
    {
      title: "Starter",
      description: "For individual professionals",
      price: "£199/month",
      features: [
        "Access to buyer directory (basic filters)",
        "Standard market reports",
        "RSS news feed",
        "1 user license",
      ],
    },
    {
      title: "Professional",
      description: "For growing teams",
      price: "£499/month",
      features: [
        "Full buyer directory access (advanced filters)",
        "Custom market reports",
        "Personalized news feed",
        "Contact information access",
        "3 user licenses",
      ],
      isPrimary: true,
    },
    {
      title: "Enterprise",
      description: "For organizations",
      price: "Custom pricing",
      features: [
        "Unlimited directory access",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Unlimited user licenses",
      ],
    },
  ]

  return (
    <section id="pricing" className="container py-12 md:py-24 lg:py-32 bg-british-lightBlue/20">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-british-navy">
          Simple, Transparent Pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Choose the plan that fits your needs, with flexible options for teams of all sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-12">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className={`flex flex-col ${plan.isPrimary ? "border-british-navy shadow-lg" : ""}`}>
            <CardHeader>
              <CardTitle className={plan.isPrimary ? "text-british-navy" : ""}>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 text-4xl font-bold text-british-navy">
                {plan.price.includes("Custom") ? (
                  <>
                    Custom<span className="text-base font-normal text-muted-foreground"> pricing</span>
                  </>
                ) : (
                  <>
                    {plan.price.split("/")[0]}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <ChevronRight className="h-4 w-4 text-british-navy mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.title === "Enterprise" ? "outline" : plan.isPrimary ? "british" : "default"}
              >
                {plan.title === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

