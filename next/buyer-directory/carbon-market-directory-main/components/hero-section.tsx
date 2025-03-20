import Link from "next/link"
import { ArrowRight, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-british-navy via-british-navy to-british-darkNavy text-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                The UK's Premier Carbon Market Buyer Directory
              </h1>
              <p className="max-w-[600px] text-british-lightBlue md:text-xl">
                Connect with 1,000+ verified carbon credit buyers. Access detailed profiles, contact information, and
                market insights to accelerate your carbon market success.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/directory">
                <Button size="lg" className="px-8 bg-british-red text-white hover:bg-british-red/90">
                  Explore Carbon Directory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/directory">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Directory Access
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="ghost"
                  className="px-8 text-white hover:bg-british-darkNavy hover:text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-medium text-white">1,000+</span>
                <span className="text-british-lightBlue">Buyer Profiles</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-white">50+</span>
                <span className="text-british-lightBlue">Industries</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-white">Weekly</span>
                <span className="text-british-lightBlue">Updates</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[450px] overflow-hidden rounded-lg border bg-white p-2">
              <div className="absolute inset-0 bg-gradient-to-r from-british-navy/10 to-british-navy/5 rounded-lg"></div>
              <div className="relative h-full w-full rounded-lg bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-british-navy">Carbon Buyer Directory</div>
                      <div className="text-sm text-muted-foreground">Updated Today</div>
                    </div>
                    <div className="h-8 w-full rounded-md bg-british-lightBlue/30"></div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="font-medium">Microsoft</div>
                      <div className="text-sm text-muted-foreground">8M credits</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="font-medium">Shell</div>
                      <div className="text-sm text-muted-foreground">50M credits</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="font-medium">Delta Air Lines</div>
                      <div className="text-sm text-muted-foreground">12M credits</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="font-medium">Google</div>
                      <div className="text-sm text-muted-foreground">Carbon neutral since 2007</div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="font-medium">Salesforce</div>
                      <div className="text-sm text-muted-foreground">Net zero by 2021</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href="/directory">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-british-navy hover:text-british-navy hover:bg-british-lightBlue/30"
                      >
                        View All Buyers
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

