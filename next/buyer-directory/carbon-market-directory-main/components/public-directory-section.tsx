import Link from "next/link"
import { ArrowRight, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PublicDirectorySection() {
  return (
    <section className="py-12 md:py-24 bg-british-lightBlue/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-british-navy px-3 py-1 text-sm text-white">
              Carbon Market Data
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-british-navy">
              Explore Our Carbon Buyer Directory
            </h2>
            <p className="text-muted-foreground text-lg">
              Access our comprehensive database of carbon credit buyers, featuring detailed information on voluntary
              carbon credits and supported projects from major companies like Allianz, Google, and Amazon.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-british-navy"></div>
                <p className="font-medium">Accurate company data from verified sources</p>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-british-navy"></div>
                <p className="font-medium">Carbon credit volumes for the last 5 years</p>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-british-navy"></div>
                <p className="font-medium">Detailed project types and sustainability initiatives</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/directory">
                <Button size="lg" className="bg-british-navy text-white hover:bg-british-darkNavy">
                  <Database className="mr-2 h-5 w-5" />
                  Explore Carbon Buyer Directory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl border bg-background p-2">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Carbon Buyer Directory</h3>
                  <Badge variant="outline">Live Data</Badge>
                </div>
                <div className="space-y-2">
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Allianz</div>
                    <div className="text-sm text-muted-foreground">
                      Carbon-neutral Renewable energy and forest conservation offsets (global)
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Alphabet (Google)</div>
                    <div className="text-sm text-muted-foreground">
                      Carbon-neutral High-quality renewable energy and forestry projects
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Amazon</div>
                    <div className="text-sm text-muted-foreground">
                      Buys offsets | Forest conservation (LEAF Coalition) and other nature projects
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href="/directory">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

