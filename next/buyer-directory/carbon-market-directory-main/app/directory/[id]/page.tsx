import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  BarChart3,
  Building,
  Calendar,
  Download,
  ExternalLink,
  Globe,
  MapPin,
  Share2,
  Star,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PurchaseHistoryChart } from "@/components/purchase-history-chart"
import { ProjectTypeChart } from "@/components/project-type-chart"
import { ContactCard } from "@/components/contact-card"

export default function BuyerProfilePage({ params }: { params: { id: string } }) {
  // This would normally fetch data based on the ID
  const buyer = {
    id: params.id,
    name: "Microsoft",
    logo: "/placeholder.svg",
    industry: "Technology",
    headquarters: "Redmond, Washington, USA",
    website: "https://microsoft.com",
    description:
      "Microsoft Corporation is an American multinational technology corporation that produces computer software, consumer electronics, personal computers, and related services. Microsoft has been carbon neutral across its global operations since 2012 and has committed to being carbon negative by 2030.",
    carbonStrategy:
      "Microsoft has committed to being carbon negative by 2030 and by 2050 to remove from the environment all the carbon the company has emitted either directly or by electrical consumption since it was founded in 1975. The company has established a $1 billion climate innovation fund to accelerate the global development of carbon reduction, capture, and removal technologies.",
    netZeroTarget: "2030 (carbon negative)",
    purchaseHistory: [
      { year: "2020", volume: 1.3 },
      { year: "2021", volume: 1.5 },
      { year: "2022", volume: 2.4 },
      { year: "2023", volume: 3.2 },
      { year: "2024", volume: 8.0 },
    ],
    projectTypes: [
      { type: "Nature-based Removal", percentage: 45 },
      { type: "Direct Air Capture", percentage: 25 },
      { type: "Soil Carbon", percentage: 15 },
      { type: "Biochar", percentage: 10 },
      { type: "Other", percentage: 5 },
    ],
    keyContacts: [
      {
        name: "Jane Smith",
        title: "Chief Sustainability Officer",
        email: "jane.smith@example.com",
        phone: "+1 (555) 123-4567",
        linkedin: "https://linkedin.com/in/janesmith",
      },
      {
        name: "John Doe",
        title: "Carbon Strategy Director",
        email: "john.doe@example.com",
        phone: "+1 (555) 987-6543",
        linkedin: "https://linkedin.com/in/johndoe",
      },
    ],
    recentPurchases: [
      {
        date: "March 2024",
        project: "Tropical Forest Conservation (Brazil)",
        developer: "ForestCarbon Partners",
        volume: "5,000,000 tCO₂e",
        type: "REDD+",
      },
      {
        date: "January 2024",
        project: "Direct Air Capture Facility (Iceland)",
        developer: "Climeworks",
        volume: "1,000,000 tCO₂e",
        type: "Technology-based Removal",
      },
      {
        date: "November 2023",
        project: "Soil Carbon Enhancement (USA)",
        developer: "Indigo Agriculture",
        volume: "2,200,000 tCO₂e",
        type: "Agricultural Carbon",
      },
    ],
    relatedNews: [
      {
        title: "Microsoft announces largest-ever carbon removal deal",
        source: "Carbon Pulse",
        date: "2 days ago",
        url: "#",
      },
      {
        title: "Microsoft partners with Climeworks for direct air capture",
        source: "Environmental Finance",
        date: "2 months ago",
        url: "#",
      },
      {
        title: "Microsoft's carbon removal portfolio diversifies with soil carbon",
        source: "GreenBiz",
        date: "4 months ago",
        url: "#",
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/directory" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Star className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="w-24 h-24 rounded-lg border flex items-center justify-center bg-white p-2 shrink-0">
              <Image
                src={buyer.logo || "/placeholder.svg"}
                alt={`${buyer.name} logo`}
                width={80}
                height={80}
                className="max-w-full max-h-full"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{buyer.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">{buyer.industry}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {buyer.headquarters}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  <a href={buyer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {buyer.website.replace("https://", "")}
                  </a>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end">
              <div className="text-sm font-medium text-muted-foreground">Net Zero Target</div>
              <div className="font-semibold">{buyer.netZeroTarget}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">About</h3>
                      <p>{buyer.description}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Carbon Strategy</h3>
                      <p>{buyer.carbonStrategy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>Annual carbon credit volume (millions tCO₂e)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <PurchaseHistoryChart data={buyer.purchaseHistory} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Type Preferences</CardTitle>
                    <CardDescription>Based on historical purchases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ProjectTypeChart data={buyer.projectTypes} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>Latest carbon credit transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {buyer.recentPurchases.map((purchase, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <div className="font-medium">{purchase.project}</div>
                          <Badge variant="outline">{purchase.type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {purchase.date}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Building className="h-3.5 w-3.5 mr-1" />
                            {purchase.developer}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5 mr-1" />
                            {purchase.volume}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Key Contacts</CardTitle>
                  <CardDescription>Decision makers for carbon purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {buyer.keyContacts.map((contact, index) => (
                      <ContactCard key={index} contact={contact} />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View All Contacts
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Related News</CardTitle>
                  <CardDescription>Latest updates about {buyer.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {buyer.relatedNews.map((news, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium mb-1">{news.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {news.date}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                            <span className="sr-only">Read more</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All News
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Similar Buyers</CardTitle>
                  <CardDescription>Companies with similar profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/directory/2" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                      <div className="w-8 h-8 rounded border flex items-center justify-center bg-white">
                        <Image src="/placeholder.svg" alt="Google logo" width={24} height={24} />
                      </div>
                      <div>
                        <div className="font-medium">Google</div>
                        <div className="text-xs text-muted-foreground">Technology</div>
                      </div>
                    </Link>
                    <Link href="/directory/3" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                      <div className="w-8 h-8 rounded border flex items-center justify-center bg-white">
                        <Image src="/placeholder.svg" alt="Salesforce logo" width={24} height={24} />
                      </div>
                      <div>
                        <div className="font-medium">Salesforce</div>
                        <div className="text-xs text-muted-foreground">Technology</div>
                      </div>
                    </Link>
                    <Link href="/directory/4" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                      <div className="w-8 h-8 rounded border flex items-center justify-center bg-white">
                        <Image src="/placeholder.svg" alt="Apple logo" width={24} height={24} />
                      </div>
                      <div>
                        <div className="font-medium">Apple</div>
                        <div className="text-xs text-muted-foreground">Technology</div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

