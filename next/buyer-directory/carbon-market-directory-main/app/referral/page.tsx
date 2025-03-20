import Link from "next/link"
import { ArrowLeft, Copy, Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function ReferralPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
              <p className="text-muted-foreground">
                Earn rewards by referring colleagues and partners to CarbonConnect
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Link</CardTitle>
                  <CardDescription>Share this link with your network to earn rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input value="https://carbonconnect.com/ref/user123" readOnly />
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share via Email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Users className="mr-2 h-4 w-4" />
                      Invite Contacts
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Referral Activity</CardTitle>
                  <CardDescription>Track your referrals and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="successful">Successful</TabsTrigger>
                      <TabsTrigger value="all">All Referrals</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-6">
                      <div className="rounded-md border">
                        <div className="p-4 text-center text-muted-foreground">No pending referrals at the moment</div>
                      </div>
                    </TabsContent>
                    <TabsContent value="successful" className="mt-6">
                      <div className="rounded-md border">
                        <div className="p-4 text-center text-muted-foreground">No successful referrals yet</div>
                      </div>
                    </TabsContent>
                    <TabsContent value="all" className="mt-6">
                      <div className="rounded-md border">
                        <div className="p-4 text-center text-muted-foreground">No referrals yet</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Rewards Summary</CardTitle>
                  <CardDescription>Your current earnings and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</div>
                      <div className="text-3xl font-bold">£0.00</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-muted-foreground">Referral Tier</span>
                        <span className="font-medium">Bronze</span>
                      </div>
                      <Progress value={20} className="h-2" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>0 referrals</span>
                        <span>5 for Silver</span>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-2">Reward Tiers</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bronze (0-4 referrals)</span>
                          <span className="font-medium">20% commission</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Silver (5-9 referrals)</span>
                          <span className="font-medium">25% commission</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gold (10+ referrals)</span>
                          <span className="font-medium">30% commission</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Payout History
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>Resources for the referral program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="#" className="text-sm text-primary hover:underline block">
                      Referral Program FAQ
                    </Link>
                    <Link href="#" className="text-sm text-primary hover:underline block">
                      Marketing Materials
                    </Link>
                    <Link href="#" className="text-sm text-primary hover:underline block">
                      Contact Support
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

