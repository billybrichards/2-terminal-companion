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

// Sample data for the public directory
const publicBuyerData: BuyerData[] = [
  {
    name: "Allianz",
    industry: "Insurance",
    voluntary_carbon_credits_last_5years: "5.2M tCO₂e",
    projects_supported: ["Carbon-neutral Renewable energy and forest conservation offsets (global)"],
  },
  {
    name: "Alphabet (Google)",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "8.7M tCO₂e",
    projects_supported: ["Carbon-neutral High-quality renewable energy and forestry projects"],
  },
  {
    name: "Amazon",
    industry: "E-Commerce",
    voluntary_carbon_credits_last_5years: "7.5M tCO₂e",
    projects_supported: ["Buys offsets | Forest conservation (LEAF Coalition) and other nature projects"],
  },
]

export function PublicDirectory() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter buyers based on search term
  const filteredBuyers = publicBuyerData.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.projects_supported.some((project) => project.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle export functionality
  const handleExport = () => {
    const csvContent = [
      ["Name", "Industry", "Voluntary Carbon Credits (Last 5 Years)", "Projects Supported"].join(","),
      ...filteredBuyers.map((buyer) =>
        [
          buyer.name,
          buyer.industry,
          buyer.voluntary_carbon_credits_last_5years,
          `"${buyer.projects_supported.join("; ")}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "carbon_buyers_public_directory.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Carbon Buyer Directory</h2>
          <p className="text-muted-foreground">Public information on companies purchasing voluntary carbon credits</p>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
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

