"use client"

import { useState, useEffect } from "react"
import type { Lead } from "@/types/lead"

/**
 * Custom hook for fetching and managing leads data
 */
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setLeads([
          {
            id: 1,
            company: "Microsoft",
            contact: "Jane Smith",
            status: "Active",
            lastContact: "2 hours ago",
            value: "$50,000",
          },
          {
            id: 2,
            company: "Shell",
            contact: "John Doe",
            status: "Negotiation",
            lastContact: "2 days ago",
            value: "$120,000",
          },
          {
            id: 3,
            company: "Delta Air Lines",
            contact: "Sarah Johnson",
            status: "Contacted",
            lastContact: "1 week ago",
            value: "$75,000",
          },
          {
            id: 4,
            company: "Google",
            contact: "Michael Chen",
            status: "Active",
            lastContact: "3 days ago",
            value: "$90,000",
          },
          {
            id: 5,
            company: "Salesforce",
            contact: "Emma Williams",
            status: "Closed",
            lastContact: "1 month ago",
            value: "$60,000",
          },
        ])
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  return { leads, isLoading, error }
}

