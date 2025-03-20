import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definition for buyer data from Supabase
export interface BuyerData {
  id: string
  name: string
  industry: string
  voluntary_carbon_credits_last_5years: string
  projects_supported: string
  contact_email?: string
  homepage_url?: string
  contact_page_url?: string
  notes?: string
  created_at?: string
  source?: string
}

// Type for filter parameters
export interface BuyerFilters {
  search?: string
  industries?: string[]
  projectTypes?: string[]
  sortBy?: string
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
}

// Fallback data in case of database connection issues
const fallbackBuyerData: BuyerData[] = [
  {
    id: "1",
    name: "Allianz",
    industry: "Insurance",
    voluntary_carbon_credits_last_5years: "5.2M tCO₂e",
    projects_supported: "Carbon-neutral | Renewable energy and forest conservation offsets (global)",
    source: "Public reports",
  },
  {
    id: "2",
    name: "Alphabet (Google)",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "8.7M tCO₂e",
    projects_supported: "Carbon-neutral | High-quality renewable energy and forestry projects",
    source: "Public reports",
  },
  {
    id: "3",
    name: "Amazon",
    industry: "E-Commerce",
    voluntary_carbon_credits_last_5years: "7.5M tCO₂e",
    projects_supported: "Buys offsets | Forest conservation (LEAF Coalition) and other nature projects",
    source: "Public reports",
  },
  {
    id: "4",
    name: "Apple",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "4.3M tCO₂e",
    projects_supported: "Carbon-neutral for corporate emissions | Mangrove restoration and grassland conservation",
    source: "Public reports",
  },
  {
    id: "5",
    name: "Bank of America",
    industry: "Banking",
    voluntary_carbon_credits_last_5years: "3.1M tCO₂e",
    projects_supported: "Carbon-neutral | Renewable energy and reforestation projects",
    source: "Public reports",
  },
  {
    id: "6",
    name: "BP",
    industry: "Energy",
    voluntary_carbon_credits_last_5years: "12.8M tCO₂e",
    projects_supported: "Net zero target | Forest protection and renewable energy projects",
    source: "Public reports",
  },
  {
    id: "7",
    name: "Delta Airlines",
    industry: "Aviation",
    voluntary_carbon_credits_last_5years: "6.7M tCO₂e",
    projects_supported: "Carbon-neutral | Forest protection and waste-to-energy projects",
    source: "Public reports",
  },
  {
    id: "8",
    name: "HSBC",
    industry: "Banking",
    voluntary_carbon_credits_last_5years: "2.9M tCO₂e",
    projects_supported: "Carbon-neutral | Renewable energy and forest conservation projects",
    source: "Public reports",
  },
  {
    id: "9",
    name: "Microsoft",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "9.5M tCO₂e",
    projects_supported: "Carbon-negative | Forest conservation and direct air capture",
    source: "Public reports",
  },
  {
    id: "10",
    name: "Nestlé",
    industry: "Food & Beverage",
    voluntary_carbon_credits_last_5years: "4.8M tCO₂e",
    projects_supported: "Net zero target | Reforestation and regenerative agriculture",
    source: "Public reports",
  },
]

// Function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...")
    const { data, error, count } = await supabase.from("buyers_public").select("*", { count: "exact" })

    if (error) {
      console.error("Supabase connection error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Function to fetch buyers from Supabase
export async function fetchBuyers() {
  try {
    console.log("Fetching buyers from Supabase...")
    const { data, error } = await supabase.from("buyers_public").select("*")

    if (error) {
      console.error("Error fetching buyers:", error)
      console.log("Using fallback data instead")
      return fallbackBuyerData
    }

    if (!data || data.length === 0) {
      console.log("No data returned from Supabase, using fallback data")
      return fallbackBuyerData
    }

    console.log(`Successfully fetched ${data.length} buyers`)
    return data as BuyerData[]
  } catch (error) {
    console.error("Unexpected error fetching buyers:", error)
    console.log("Using fallback data due to error")
    return fallbackBuyerData
  }
}

// Function to fetch buyers by name (partial match)
export async function fetchBuyersByName(nameQuery: string) {
  try {
    console.log(`Searching buyers with name query: ${nameQuery}`)
    const { data, error } = await supabase.from("buyers_public").select("*").ilike("name", `%${nameQuery}%`)

    if (error) {
      console.error("Error fetching buyers by name:", error)
      return []
    }

    return data as BuyerData[]
  } catch (error) {
    console.error("Unexpected error fetching buyers by name:", error)
    return []
  }
}

// Advanced function to fetch buyers with filters
export async function fetchBuyersWithFilters(filters: BuyerFilters) {
  try {
    console.log("Fetching buyers with filters:", filters)

    let query = supabase.from("buyers_public").select("*", { count: "exact" })

    // Apply search filter
    if (filters.search && filters.search.trim() !== "") {
      query = query.ilike("name", `%${filters.search}%`)
    }

    // Apply industry filter
    if (filters.industries && filters.industries.length > 0) {
      query = query.in("industry", filters.industries)
    }

    // Apply sorting
    if (filters.sortBy) {
      const order = filters.sortDirection || "asc"
      query = query.order(filters.sortBy, { ascending: order === "asc" })
    }

    // Apply pagination if specified
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize
      const to = from + filters.pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching buyers with filters:", error)
      return {
        data: fallbackBuyerData,
        count: fallbackBuyerData.length,
      }
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        count: 0,
      }
    }

    // Project type filtering needs to be done client-side since it's text-based
    // and we need more complex matching
    let results = data as BuyerData[]

    if (filters.projectTypes && filters.projectTypes.length > 0) {
      results = results.filter((buyer) => {
        if (!buyer.projects_supported) return false

        return filters.projectTypes!.some((type) => buyer.projects_supported.toLowerCase().includes(type.toLowerCase()))
      })
    }

    return {
      data: results,
      count: count || results.length,
    }
  } catch (error) {
    console.error("Unexpected error fetching buyers with filters:", error)
    return {
      data: fallbackBuyerData,
      count: fallbackBuyerData.length,
    }
  }
}

