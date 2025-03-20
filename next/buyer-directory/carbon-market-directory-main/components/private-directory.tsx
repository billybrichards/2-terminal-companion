"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type BuyerData, fetchBuyersByName } from "@/lib/supabase"
import { LoadingState } from "@/components/loading-state"

interface PrivateDirectoryProps {
  initialBuyers: BuyerData[]
}

export function PrivateDirectory({ initialBuyers }: PrivateDirectoryProps) {
  const [buyers, setBuyers] = useState<BuyerData[]>(initialBuyers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle search with Supabase integration
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setBuyers(initialBuyers)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const results = await fetchBuyersByName(searchTerm)
        setBuyers(results)
      } catch (err) {
        console.error("Error searching buyers:", err)
        setError("Failed to search buyers. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, initialBuyers])

  // Function to parse projects_supported string into an array
  const parseProjects = (projectsString: string): string[] => {
    if (!projectsString) return []

    // Split by common delimiters
    return projectsString
      .split(/[,;|]/)
      .map((p) => p.trim())
      .filter(Boolean)
  }

  // Handle export functionality
  const handleExport = () => {
    const csvContent = [
      ["Name", "Industry", "Voluntary Carbon Credits (Last 5 Years)", "Projects Supported"].join(","),
      ...buyers.map((buyer) =>
        [buyer.name, buyer.industry, buyer.voluntary_carbon_credits_last_5years, `"${buyer.projects_supported}"`].join(
          ",",
        ),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "carbon_buyers_directory.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Carbon Buyer Directory</h2>
          <p className="text-muted-foreground">
            Comprehensive database of companies purchasing voluntary carbon credits
          </p>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <LoadingState />
                </TableCell>
              </TableRow>
            ) : buyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No buyers found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>{buyer.industry}</TableCell>
                  <TableCell>{buyer.voluntary_carbon_credits_last_5years}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseProjects(buyer.projects_supported).map((project, index) => (
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

