/**
 * Main buyer information
 */
export interface Buyer {
  id: number
  name: string
  industry: string
  volume: string
  projectTypes: string[]
  lastPurchase: string
  netZeroTarget: string
  isSaved?: boolean
}

/**
 * Activity types for the Recent Activity tab
 */
export type ActivityType =
  | "Purchase"
  | "Inquiry"
  | "ProfileUpdate"
  | "ContactAdded"
  | "DocumentUploaded"
  | "NoteAdded"
  | "StatusChange"
  | "MeetingScheduled"
  | "EmailSent"
  | "CallLogged"

/**
 * Activity entry for the Recent Activity tab
 */
export interface BuyerActivity {
  id: number
  buyerId: number
  buyerName: string
  buyerIndustry: string
  timestamp: string
  type: ActivityType
  title: string
  description: string
  performedBy?: {
    id: number
    name: string
    avatar?: string
  }
  relatedTo?: {
    type: "Project" | "Contact" | "Document" | "Meeting"
    id: number
    name: string
    url?: string
  }
  metadata?: Record<string, any>
}

/**
 * Purchase-specific activity metadata
 */
export interface PurchaseActivityMetadata {
  projectType: string
  volume: number // in tCO2e
  value?: number
  currency?: string
  vintage?: number
  standard?: string
  location?: string
}

/**
 * Volume metrics for the Volume tab
 */
export interface BuyerVolumeMetrics {
  buyerId: number
  buyerName: string
  buyerIndustry: string
  totalVolume: number // in tCO2e
  totalSpend?: number
  currency?: string
  averagePrice?: number
  transactionCount: number
  yearlyVolumes: {
    year: string
    volume: number
  }[]
  projectTypeBreakdown: {
    type: string
    percentage: number
  }[]
  lastTransaction: string
  volumeTrend: "Increasing" | "Stable" | "Decreasing"
  yearOverYearChange: number // Percentage
}

/**
 * Filter parameters for the buyer directory
 */
export interface BuyerDirectoryFilters {
  search?: string
  industries?: string[]
  projectTypes?: string[]
  minVolume?: number
  maxVolume?: number
  netZeroTargetBefore?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

/**
 * Pagination parameters
 */
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

