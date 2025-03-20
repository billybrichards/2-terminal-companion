"use client"

import { useState } from "react"
import { Search, ArrowUpDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Define the type for our buyer data
interface BuyerData {
  name: string
  industry: string
  voluntary_carbon_credits_last_5years: string
  projects_supported: string[]
}

// Sample data for the directory
const buyerData: BuyerData[] = [
  {
    name: "Allianz",
    industry: "Insurance",
    voluntary_carbon_credits_last_5years: "5.2M tCO₂e",
    projects_supported: ["Carbon-neutral Renewable energy projects", "Forest conservation offsets (global)"],
  },
  {
    name: "Alphabet (Google)",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "8.7M tCO₂e",
    projects_supported: ["Carbon-neutral High-quality renewable energy projects", "Forestry projects"],
  },
  {
    name: "Amazon",
    industry: "E-Commerce",
    voluntary_carbon_credits_last_5years: "7.5M tCO₂e",
    projects_supported: ["Forest conservation (LEAF Coalition)", "Other nature projects"],
  },
]

export function BuyerDirectoryV1() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter buyers based on search term
  const filteredBuyers = buyerData.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.projects_supported.some((project) => project.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Legacy Carbon Buyer Directory (v1)</h2>
          <p className="text-muted-foreground">Historical version of the carbon buyer directory with static data</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search buyers..."
              className="w-full md:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-british-navy text-white">
            <TableRow>
              <TableHead className="text-white">
                <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                  <span>Company Name</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white">Industry</TableHead>
              <TableHead className="text-white">
                <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                  <span>Carbon Credits (Last 5 Years)</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white">Projects Supported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No buyers found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredBuyers.map((buyer) => (
                <TableRow key={buyer.name}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>{buyer.industry}</TableCell>
                  <TableCell>{buyer.voluntary_carbon_credits_last_5years}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {buyer.projects_supported.map((project, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

