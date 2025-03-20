"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, Filter, Newspaper, Tag } from "lucide-react"

export function NewsFilters() {
  const [autoRefresh, setAutoRefresh] = useState(false)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            News Filters
          </h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
              <div className="text-xs text-muted-foreground">Automatically refresh news every 30 minutes</div>
            </div>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          <Accordion type="multiple" defaultValue={["categories", "sources", "timeframe"]}>
            <AccordionItem value="categories">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Categories
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <CategoryCheckbox id="carbon-markets" label="Carbon Markets" />
                  <CategoryCheckbox id="renewable-energy" label="Renewable Energy" />
                  <CategoryCheckbox id="climate-policy" label="Climate Policy" />
                  <CategoryCheckbox id="sustainability" label="Sustainability" />
                  <CategoryCheckbox id="net-zero" label="Net Zero" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sources">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Newspaper className="h-4 w-4 mr-2" />
                  Sources
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <CategoryCheckbox id="green-earth" label="Green Earth" />
                  <CategoryCheckbox id="carbon-pulse" label="Carbon Pulse" />
                  <CategoryCheckbox id="carbon-brief" label="Carbon Brief" />
                  <CategoryCheckbox id="cleantechnica" label="CleanTechnica" />
                  <CategoryCheckbox id="edie" label="Edie" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timeframe">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Time Frame
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <CategoryCheckbox id="today" label="Today" />
                  <CategoryCheckbox id="this-week" label="This Week" />
                  <CategoryCheckbox id="this-month" label="This Month" />
                  <CategoryCheckbox id="this-year" label="This Year" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryCheckbox({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border-gray-300 text-british-navy focus:ring-british-navy"
      />
      <Label htmlFor={id} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  )
}

