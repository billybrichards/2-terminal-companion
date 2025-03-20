"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import type { BuyerData } from "@/lib/supabase"
import { useMemo } from "react"

interface BuyersAnalyticsProps {
  buyers: BuyerData[]
}

export function BuyersAnalytics({ buyers }: BuyersAnalyticsProps) {
  // Calculate industry distribution
  const industryData = useMemo(() => {
    const industries: Record<string, number> = {}

    buyers.forEach((buyer) => {
      if (!buyer.industry) return

      if (industries[buyer.industry]) {
        industries[buyer.industry]++
      } else {
        industries[buyer.industry] = 1
      }
    })

    return Object.entries(industries)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [buyers])

  // Extract project types
  const projectTypeData = useMemo(() => {
    const projectTypes: Record<string, number> = {}

    buyers.forEach((buyer) => {
      if (!buyer.projects_supported) return

      // Extract keywords for project types
      const keywords = [
        "Renewable energy",
        "Forest",
        "Carbon-neutral",
        "Net zero",
        "Conservation",
        "Reforestation",
        "Restoration",
        "Direct air capture",
        "Agriculture",
      ]

      keywords.forEach((keyword) => {
        if (buyer.projects_supported.includes(keyword)) {
          if (projectTypes[keyword]) {
            projectTypes[keyword]++
          } else {
            projectTypes[keyword] = 1
          }
        }
      })
    })

    return Object.entries(projectTypes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [buyers])

  // Colors for charts
  const COLORS = [
    "#003366", // british-navy
    "#1a4d80",
    "#336699",
    "#4d80b3",
    "#6699cc",
    "#99ccff", // british-lightBlue
    "#b3d9ff",
    "#cce6ff",
    "#e6f2ff",
  ]

  return (
    <Tabs defaultValue="industry">
      <TabsList className="mb-4">
        <TabsTrigger value="industry">Industry Distribution</TabsTrigger>
        <TabsTrigger value="projectTypes">Project Types</TabsTrigger>
      </TabsList>

      <TabsContent value="industry">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyers by Industry</CardTitle>
              <CardDescription>Distribution of buyers across different industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData.slice(0, 9)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {industryData.slice(0, 9).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} buyers`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Industries</CardTitle>
              <CardDescription>Buyer count by industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={industryData.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => [`${value} buyers`, "Count"]} />
                    <Bar dataKey="value" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="projectTypes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Types Distribution</CardTitle>
              <CardDescription>Common carbon project types supported by buyers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} buyers`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Project Types</CardTitle>
              <CardDescription>Most supported carbon project types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectTypeData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value) => [`${value} buyers`, "Count"]} />
                    <Bar dataKey="value" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

