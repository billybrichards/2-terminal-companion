"use client"

import { useState, useEffect } from "react"
import type { Buyer, BuyerActivity, BuyerVolumeMetrics, BuyerDirectoryFilters } from "@/types/buyer"

// Mock data for buyers
const mockBuyers: Buyer[] = [
  {
    id: 1,
    name: "Microsoft",
    industry: "Technology",
    volume: "8M credits",
    projectTypes: ["Nature-based", "Removal"],
    lastPurchase: "2024",
    netZeroTarget: "2030",
  },
  {
    id: 2,
    name: "Shell",
    industry: "Energy",
    volume: "50M credits",
    projectTypes: ["REDD+", "Renewable Energy"],
    lastPurchase: "2023",
    netZeroTarget: "2050",
  },
  {
    id: 3,
    name: "Delta Air Lines",
    industry: "Aviation",
    volume: "12M credits",
    projectTypes: ["Forestry", "Avoided Deforestation"],
    lastPurchase: "2021",
    netZeroTarget: "2050",
  },
  {
    id: 4,
    name: "Google",
    industry: "Technology",
    volume: "Carbon neutral since 2007",
    projectTypes: ["Renewable Energy", "Forestry"],
    lastPurchase: "2023",
    netZeroTarget: "2030",
  },
  {
    id: 5,
    name: "Salesforce",
    industry: "Technology",
    volume: "Net zero by 2021",
    projectTypes: ["Carbon Removal", "Forestry"],
    lastPurchase: "2022",
    netZeroTarget: "Achieved",
  },
  {
    id: 6,
    name: "JPMorgan Chase",
    industry: "Finance",
    volume: "Carbon neutral operations",
    projectTypes: ["Forest Conservation", "Renewable Energy"],
    lastPurchase: "2023",
    netZeroTarget: "2050",
  },
  {
    id: 7,
    name: "Stripe",
    industry: "Technology",
    volume: "Frontier fund ($1B+)",
    projectTypes: ["Carbon Removal", "Direct Air Capture"],
    lastPurchase: "2023",
    netZeroTarget: "2040",
  },
]

// Mock data for activities
const mockActivities: BuyerActivity[] = [
  {
    id: 1,
    buyerId: 1,
    buyerName: "Microsoft",
    buyerIndustry: "Technology",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: "Purchase",
    title: "Carbon Credit Purchase",
    description: "Purchased 500,000 tCO₂e from Amazon Rainforest Conservation Project",
    performedBy: {
      id: 101,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    relatedTo: {
      type: "Project",
      id: 201,
      name: "Amazon Rainforest Conservation",
    },
    metadata: {
      projectType: "REDD+",
      volume: 500000,
      value: 7500000,
      currency: "USD",
      vintage: 2023,
    },
  },
  {
    id: 2,
    buyerId: 2,
    buyerName: "Shell",
    buyerIndustry: "Energy",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: "Inquiry",
    title: "Project Inquiry",
    description: "Requested information about Direct Air Capture projects in Europe",
    performedBy: {
      id: 102,
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 3,
    buyerId: 4,
    buyerName: "Google",
    buyerIndustry: "Technology",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    type: "ProfileUpdate",
    title: "Updated Net Zero Target",
    description: "Changed net zero target from 2035 to 2030",
  },
  {
    id: 4,
    buyerId: 3,
    buyerName: "Delta Air Lines",
    buyerIndustry: "Aviation",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    type: "MeetingScheduled",
    title: "Meeting with Project Developer",
    description: "Scheduled meeting with Indigo Agriculture to discuss soil carbon projects",
    performedBy: {
      id: 103,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    relatedTo: {
      type: "Contact",
      id: 301,
      name: "Michael Chen, Indigo Agriculture",
    },
  },
  {
    id: 5,
    buyerId: 5,
    buyerName: "Salesforce",
    buyerIndustry: "Technology",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    type: "Purchase",
    title: "Carbon Credit Purchase",
    description: "Purchased 250,000 tCO₂e from Mangrove Restoration Project",
    performedBy: {
      id: 104,
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    metadata: {
      projectType: "Blue Carbon",
      volume: 250000,
      value: 3750000,
      currency: "USD",
      vintage: 2023,
    },
  },
]

// Mock data for volume metrics
const mockVolumeData: BuyerVolumeMetrics[] = [
  {
    buyerId: 1,
    buyerName: "Microsoft",
    buyerIndustry: "Technology",
    totalVolume: 8000000,
    totalSpend: 120000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 12,
    yearlyVolumes: [
      { year: "2020", volume: 1300000 },
      { year: "2021", volume: 1500000 },
      { year: "2022", volume: 2400000 },
      { year: "2023", volume: 3200000 },
      { year: "2024", volume: 8000000 },
    ],
    projectTypeBreakdown: [
      { type: "Nature-based Removal", percentage: 45 },
      { type: "Direct Air Capture", percentage: 25 },
      { type: "Soil Carbon", percentage: 15 },
      { type: "Biochar", percentage: 10 },
      { type: "Other", percentage: 5 },
    ],
    lastTransaction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 150,
  },
  {
    buyerId: 2,
    buyerName: "Shell",
    buyerIndustry: "Energy",
    totalVolume: 50000000,
    totalSpend: 750000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 25,
    yearlyVolumes: [
      { year: "2020", volume: 10000000 },
      { year: "2021", volume: 15000000 },
      { year: "2022", volume: 25000000 },
      { year: "2023", volume: 40000000 },
      { year: "2024", volume: 50000000 },
    ],
    projectTypeBreakdown: [
      { type: "REDD+", percentage: 40 },
      { type: "Renewable Energy", percentage: 30 },
      { type: "Methane Capture", percentage: 20 },
      { type: "Afforestation", percentage: 10 },
    ],
    lastTransaction: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 25,
  },
  {
    buyerId: 3,
    buyerName: "Delta Air Lines",
    buyerIndustry: "Aviation",
    totalVolume: 12000000,
    totalSpend: 180000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 8,
    yearlyVolumes: [
      { year: "2020", volume: 3000000 },
      { year: "2021", volume: 5000000 },
      { year: "2022", volume: 8000000 },
      { year: "2023", volume: 10000000 },
      { year: "2024", volume: 12000000 },
    ],
    projectTypeBreakdown: [
      { type: "Forestry", percentage: 50 },
      { type: "Avoided Deforestation", percentage: 30 },
      { type: "Sustainable Aviation Fuel", percentage: 20 },
    ],
    lastTransaction: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 20,
  },
  {
    buyerId: 4,
    buyerName: "Google",
    buyerIndustry: "Technology",
    totalVolume: 5000000,
    totalSpend: 75000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 15,
    yearlyVolumes: [
      { year: "2020", volume: 1000000 },
      { year: "2021", volume: 2000000 },
      { year: "2022", volume: 3000000 },
      { year: "2023", volume: 4000000 },
      { year: "2024", volume: 5000000 },
    ],
    projectTypeBreakdown: [
      { type: "Renewable Energy", percentage: 60 },
      { type: "Forestry", percentage: 40 },
    ],
    lastTransaction: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 25,
  },
  {
    buyerId: 5,
    buyerName: "Salesforce",
    buyerIndustry: "Technology",
    totalVolume: 3000000,
    totalSpend: 45000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 10,
    yearlyVolumes: [
      { year: "2020", volume: 500000 },
      { year: "2021", volume: 1000000 },
      { year: "2022", volume: 1500000 },
      { year: "2023", volume: 2500000 },
      { year: "2024", volume: 3000000 },
    ],
    projectTypeBreakdown: [
      { type: "Carbon Removal", percentage: 55 },
      { type: "Forestry", percentage: 45 },
    ],
    lastTransaction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 20,
  },
  {
    buyerId: 6,
    buyerName: "JPMorgan Chase",
    buyerIndustry: "Finance",
    totalVolume: 2000000,
    totalSpend: 30000000,
    currency: "$",
    averagePrice: 15,
    transactionCount: 5,
    yearlyVolumes: [
      { year: "2020", volume: 0 },
      { year: "2021", volume: 500000 },
      { year: "2022", volume: 1000000 },
      { year: "2023", volume: 1500000 },
      { year: "2024", volume: 2000000 },
    ],
    projectTypeBreakdown: [
      { type: "Forest Conservation", percentage: 60 },
      { type: "Renewable Energy", percentage: 40 },
    ],
    lastTransaction: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 33,
  },
  {
    buyerId: 7,
    buyerName: "Stripe",
    buyerIndustry: "Technology",
    totalVolume: 1000000,
    totalSpend: 20000000,
    currency: "$",
    averagePrice: 20,
    transactionCount: 8,
    yearlyVolumes: [
      { year: "2020", volume: 100000 },
      { year: "2021", volume: 300000 },
      { year: "2022", volume: 500000 },
      { year: "2023", volume: 800000 },
      { year: "2024", volume: 1000000 },
    ],
    projectTypeBreakdown: [
      { type: "Carbon Removal", percentage: 70 },
      { type: "Direct Air Capture", percentage: 30 },
    ],
    lastTransaction: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    volumeTrend: "Increasing",
    yearOverYearChange: 25,
  },
]

export function useBuyerDirectory() {
  const [buyers, setBuyers] = useState<Buyer[]>(mockBuyers)
  const [activities, setActivities] = useState<BuyerActivity[]>(mockActivities)
  const [volumeData, setVolumeData] = useState<BuyerVolumeMetrics[]>(mockVolumeData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const [filters, setFilters] = useState<BuyerDirectoryFilters>({
    sortBy: "name",
    sortDirection: "asc",
  })

  // In a real app, this would fetch data from an API based on filters
  useEffect(() => {
    // Simulate loading
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Apply filters and sorting (simplified implementation)
      let filteredBuyers = [...mockBuyers]
      let filteredActivities = [...mockActivities]
      let filteredVolumeData = [...mockVolumeData]

      // Apply industry filter if specified
      if (filters.industries && filters.industries.length > 0) {
        filteredBuyers = filteredBuyers.filter((buyer) => filters.industries!.includes(buyer.industry))

        // Filter related data based on filtered buyers
        const buyerIds = filteredBuyers.map((b) => b.id)
        filteredActivities = filteredActivities.filter((a) => buyerIds.includes(a.buyerId))
        filteredVolumeData = filteredVolumeData.filter((v) => buyerIds.includes(v.buyerId))
      }

      // Apply search filter if specified
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredBuyers = filteredBuyers.filter(
          (buyer) =>
            buyer.name.toLowerCase().includes(searchLower) || buyer.industry.toLowerCase().includes(searchLower),
        )

        // Filter related data based on filtered buyers
        const buyerIds = filteredBuyers.map((b) => b.id)
        filteredActivities = filteredActivities.filter((a) => buyerIds.includes(a.buyerId))
        filteredVolumeData = filteredVolumeData.filter((v) => buyerIds.includes(v.buyerId))
      }

      // Sort activities by timestamp (newest first)
      filteredActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Sort volume data by total volume (highest first)
      filteredVolumeData.sort((a, b) => b.totalVolume - a.totalVolume)

      setBuyers(filteredBuyers)
      setActivities(filteredActivities)
      setVolumeData(filteredVolumeData)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters])

  return {
    buyers,
    activities,
    volumeData,
    isLoading,
    error,
    filters,
    setFilters,
  }
}

