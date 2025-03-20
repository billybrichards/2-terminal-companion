import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, TrendingUp, Users, Globe, Leaf } from "lucide-react"

interface AnalyticsOverviewProps {
  totalBuyers: number
  industries: number
}

export function AnalyticsOverview({ totalBuyers, industries }: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Buyers</CardDescription>
          <CardTitle className="text-2xl flex items-center justify-between">
            {totalBuyers}
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">From our comprehensive database</div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>+12% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Industries Represented</CardDescription>
          <CardTitle className="text-2xl flex items-center justify-between">
            {industries}
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Across various sectors</div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>+3 new industries</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Average Credit Price</CardDescription>
          <CardTitle className="text-2xl flex items-center justify-between">
            $15.75
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Per tonne CO₂e</div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>+$2.30 from last quarter</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Project Types</CardDescription>
          <CardTitle className="text-2xl flex items-center justify-between">
            12+
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Different carbon offset projects</div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>+2 new types</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

