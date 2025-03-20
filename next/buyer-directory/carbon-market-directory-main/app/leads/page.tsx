import { Suspense } from "react"
import type { Metadata } from "next"
import { LeadsHeader } from "@/components/leads/leads-header"
import { LeadsContent } from "@/components/leads/leads-content"
import { LeadsStats } from "@/components/leads/leads-stats"
import { LeadsActivity } from "@/components/leads/leads-activity"
import { LeadsTableSkeleton } from "@/components/leads/leads-table-skeleton"

/**
 * Metadata for the leads page
 */
export const metadata: Metadata = {
  title: "Lead Management - CarbonConnect",
  description: "Track and manage your carbon market leads with CarbonConnect's lead management system.",
}

/**
 * Leads page component
 * Server component that renders the leads management interface
 */
export default async function LeadsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LeadsHeader />
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
              <p className="text-muted-foreground">Track and manage your carbon market leads</p>
            </div>
            <div className="w-full md:w-auto">
              <LeadsSearchBar />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Suspense fallback={<LeadsTableSkeleton />}>
                <LeadsContent />
              </Suspense>
            </div>

            <div>
              <LeadsStats />
              <LeadsActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Search bar component for leads
 */
function LeadsSearchBar() {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder="Search leads..."
        className="w-full md:w-[300px] pl-8 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}

const leads = [
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
]

