"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsTable } from "@/components/leads/leads-table"
import { useLeads } from "@/hooks/use-leads"

/**
 * Main content component for the leads page
 * Client component to handle tab interactions and data fetching
 */
export function LeadsContent() {
  const [activeTab, setActiveTab] = useState("all")
  const { leads, isLoading, error } = useLeads()

  // Filter leads based on active tab
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "all") return true
    return lead.status.toLowerCase() === activeTab.toLowerCase()
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-british-red">Error loading leads data. Please try again later.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-british-navy text-white">
        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-british-navy">
          All Leads
        </TabsTrigger>
        <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-british-navy">
          Active
        </TabsTrigger>
        <TabsTrigger value="contacted" className="data-[state=active]:bg-white data-[state=active]:text-british-navy">
          Contacted
        </TabsTrigger>
        <TabsTrigger value="closed" className="data-[state=active]:bg-white data-[state=active]:text-british-navy">
          Closed
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        <Card>
          <CardHeader className="p-4 flex items-center justify-between">
            <CardTitle>Lead List</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <LeadsTable leads={filteredLeads} isLoading={isLoading} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

