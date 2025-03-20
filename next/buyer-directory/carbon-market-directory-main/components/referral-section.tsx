import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Referral program section component for the landing page
 */
export function ReferralSection() {
  return (
    <section id="referral" className="container py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-british-navy">Refer & Earn</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Refer colleagues and partners to CarbonConnect and earn rewards for every successful referral.
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto p-8 border rounded-lg bg-card border-british-navy/20">
        <h3 className="text-xl font-bold mb-4 text-british-navy">How Our Referral Program Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-british-navy text-white flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h4 className="font-medium mb-2">Share Your Link</h4>
            <p className="text-sm text-muted-foreground">Get your unique referral link from your dashboard</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-british-navy text-white flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h4 className="font-medium mb-2">They Subscribe</h4>
            <p className="text-sm text-muted-foreground">When your referral signs up for a paid plan</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-british-navy text-white flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h4 className="font-medium mb-2">You Earn Rewards</h4>
            <p className="text-sm text-muted-foreground">Receive 20% of their first year's subscription</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button variant="british">
            Join the Referral Program
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

