import { Button } from "@/components/ui/button"

/**
 * Call-to-action section component for the landing page
 */
export function CtaSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-british-red text-white">
      <div className="container">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-white">
            Ready to Transform Your Carbon Market Strategy?
          </h2>
          <p className="max-w-[85%] leading-normal text-white/80 sm:text-lg sm:leading-7">
            Join hundreds of carbon market professionals who are already using CarbonConnect to gain a competitive edge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button size="lg" variant="secondary" className="bg-white text-british-red hover:bg-gray-100">
              Request a Demo
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
              View Directory
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

