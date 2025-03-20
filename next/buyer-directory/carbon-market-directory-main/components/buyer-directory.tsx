"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ArrowUpDown, Download, Filter, X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type BuyerData, fetchBuyersByName } from "@/lib/supabase"
import { LoadingState } from "@/components/loading-state"
import { Card, CardContent } from "@/components/ui/card"
import { DirectoryFilters } from "@/components/directory-filters"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BuyerDirectoryProps {
  initialBuyers: BuyerData[]
}

interface BuyerFilters {
  search?: string
  industries?: string[]
  projectTypes?: string[]
  sortBy: string
  sortDirection: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function BuyerDirectory({ initialBuyers }: BuyerDirectoryProps) {
  const [buyers, setBuyers] = useState<BuyerData[]>(initialBuyers)
  const [filteredBuyers, setFilteredBuyers] = useState<BuyerData[]>(initialBuyers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 100])
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Extract unique industries from buyers for filter options
  const industries = useMemo(() => {
    const uniqueIndustries = new Set<string>()
    buyers.forEach((buyer) => {
      if (buyer.industry) {
        uniqueIndustries.add(buyer.industry)
      }
    })
    return Array.from(uniqueIndustries).sort()
  }, [buyers])

  // Extract unique project types from buyers
  const projectTypes = useMemo(() => {
    const uniqueTypes = new Set<string>()
    buyers.forEach((buyer) => {
      if (buyer.projects_supported) {
        parseProjects(buyer.projects_supported).forEach((project) => {
          uniqueTypes.add(project)
        })
      }
    })
    return Array.from(uniqueTypes).sort()
  }, [buyers])

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

  // Apply filters whenever filter states change
  useEffect(() => {
    setIsLoading(true)

    // For simple search queries, we can use the client-side filtering
    if (searchTerm.trim() === "" && selectedIndustries.length === 0 && selectedProjectTypes.length === 0) {
      const results = [...buyers]

      // Apply sorting
      results.sort((a, b) => {
        const valueA = a[sortField as keyof BuyerData] || ""
        const valueB = b[sortField as keyof BuyerData] || ""

        // String comparison
        if (typeof valueA === "string" && typeof valueB === "string") {
          if (sortDirection === "asc") {
            return valueA.localeCompare(valueB)
          } else {
            return valueB.localeCompare(valueA)
          }
        }

        return 0
      })

      setFilteredBuyers(results)
      setIsLoading(false)
    } else {
      // For more complex filtering, we'll use the enhanced server-side filtering
      // This is a simplified example - in a real app, you'd want to implement
      // debouncing and cancellation of in-flight requests
      const fetchFilteredData = async () => {
        try {
          // Create a filters object
          const filters: BuyerFilters = {
            sortBy: sortField,
            sortDirection: sortDirection,
          }

          // Add search term if present
          if (searchTerm.trim() !== "") {
            filters.search = searchTerm
          }

          // Add industries if selected
          if (selectedIndustries.length > 0) {
            filters.industries = selectedIndustries
          }

          // Add project types if selected
          if (selectedProjectTypes.length > 0) {
            filters.projectTypes = selectedProjectTypes
          }

          // In a real implementation, you would use these for server-side pagination
          // filters.page = currentPage
          // filters.pageSize = itemsPerPage

          // For now, we'll simulate this with client-side pagination
          const results = await fetchBuyersByName(searchTerm)

          // Apply additional filtering that might not be handled by the server
          let filteredResults = [...results]

          // Apply industry filter if not handled by server
          if (selectedIndustries.length > 0) {
            filteredResults = filteredResults.filter(
              (buyer) => buyer.industry && selectedIndustries.includes(buyer.industry),
            )
          }

          // Apply project type filter
          if (selectedProjectTypes.length > 0) {
            filteredResults = filteredResults.filter((buyer) => {
              if (!buyer.projects_supported) return false
              const buyerProjectTypes = parseProjects(buyer.projects_supported)
              return selectedProjectTypes.some((type) =>
                buyerProjectTypes.some((buyerType) => buyerType.toLowerCase().includes(type.toLowerCase())),
              )
            })
          }

          // Apply sorting
          filteredResults.sort((a, b) => {
            const valueA = a[sortField as keyof BuyerData] || ""
            const valueB = b[sortField as keyof BuyerData] || ""

            // String comparison
            if (typeof valueA === "string" && typeof valueB === "string") {
              if (sortDirection === "asc") {
                return valueA.localeCompare(valueB)
              } else {
                return valueB.localeCompare(valueA)
              }
            }

            return 0
          })

          setFilteredBuyers(filteredResults)
        } catch (err) {
          console.error("Error applying filters:", err)
          setError("Failed to filter buyers. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchFilteredData()
    }
  }, [buyers, selectedIndustries, selectedProjectTypes, sortField, sortDirection, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBuyers.slice(indexOfFirstItem, indexOfLastItem)

  // Add this function to handle page changes
  const paginate = (pageNumber: number) => {
    // Ensure page number is within valid range
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedIndustries, selectedProjectTypes, searchTerm, sortField, sortDirection])

  // Function to parse projects_supported string into an array
  function parseProjects(projectsString: string): string[] {
    if (!projectsString) return []

    // Split by common delimiters
    return projectsString
      .split(/[,;|]/)
      .map((p) => p.trim())
      .filter(Boolean)
  }

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle export functionality
  const handleExport = () => {
    const csvContent = [
      ["Name", "Industry", "Voluntary Carbon Credits (Last 5 Years)", "Projects Supported"].join(","),
      ...filteredBuyers.map((buyer) =>
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

  // Reset all filters
  const resetFilters = () => {
    setSelectedIndustries([])
    setSelectedProjectTypes([])
    setVolumeRange([0, 100])
    setSortField("name")
    setSortDirection("asc")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carbon Buyer Directory</h1>
            <p className="text-muted-foreground">
              Comprehensive database of companies purchasing voluntary carbon credits
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedIndustries.length > 0 || selectedProjectTypes.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedIndustries.length + selectedProjectTypes.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Buyers</SheetTitle>
                  <SheetDescription>Refine the directory by applying filters</SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <DirectoryFilters
                    industries={industries}
                    projectTypes={projectTypes}
                    selectedIndustries={selectedIndustries}
                    selectedProjectTypes={selectedProjectTypes}
                    setSelectedIndustries={setSelectedIndustries}
                    setSelectedProjectTypes={setSelectedProjectTypes}
                    resetFilters={resetFilters}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop filters panel */}
          <Card className="hidden md:block">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                {(selectedIndustries.length > 0 || selectedProjectTypes.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
                    Reset
                  </Button>
                )}
              </div>

              <DirectoryFilters
                industries={industries}
                projectTypes={projectTypes}
                selectedIndustries={selectedIndustries}
                selectedProjectTypes={selectedProjectTypes}
                setSelectedIndustries={setSelectedIndustries}
                setSelectedProjectTypes={setSelectedProjectTypes}
                resetFilters={resetFilters}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            {/* Active filters display */}
            {(selectedIndustries.length > 0 || selectedProjectTypes.length > 0) && (
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {selectedIndustries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedIndustries((prev) => prev.filter((i) => i !== industry))}
                    />
                  </Badge>
                ))}
                {selectedProjectTypes.map((type) => (
                  <Badge key={type} variant="outline" className="flex items-center gap-1">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedProjectTypes((prev) => prev.filter((t) => t !== type))}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
                  Clear All
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-british-navy text-white">
                  <TableRow>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent text-white"
                        onClick={() => handleSort("name")}
                      >
                        <span>Company Name</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent text-white"
                        onClick={() => handleSort("industry")}
                      >
                        <span>Industry</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent text-white"
                        onClick={() => handleSort("voluntary_carbon_credits_last_5years")}
                      >
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
                  ) : filteredBuyers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No buyers found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((buyer) => (
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

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div>
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBuyers.length)} of{" "}
                  {filteredBuyers.length} buyers
                </div>

                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value))
                      setCurrentPage(1) // Reset to first page when changing page size
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder="15" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Page before current if it exists */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => paginate(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink isActive onClick={() => paginate(currentPage)}>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Page after current if it exists */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => paginate(currentPage + 1)}>{currentPage + 1}</PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => paginate(totalPages)}>{totalPages}</PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

