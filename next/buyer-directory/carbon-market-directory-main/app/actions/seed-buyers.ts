"use server"

import { supabase } from "@/lib/supabase"

// Initial seed data for buyers
const initialBuyers = [
  {
    name: "Allianz",
    industry: "Insurance",
    voluntary_carbon_credits_last_5years: "5.2M tCO₂e",
    projects_supported: "Carbon-neutral Renewable energy and forest conservation offsets (global)",
    source: "Public reports",
  },
  {
    name: "Alphabet (Google)",
    industry: "Technology",
    voluntary_carbon_credits_last_5years: "8.7M tCO₂e",
    projects_supported: "Carbon-neutral High-quality renewable energy and forestry projects",
    source: "Public reports",
  },
  {
    name: "Amazon",
    industry: "E-Commerce",
    voluntary_carbon_credits_last_5years: "7.5M tCO₂e",
    projects_supported: "Buys offsets | Forest conservation (LEAF Coalition) and other nature projects",
    source: "Public reports",
  },
]

export async function seedBuyersData() {
  try {
    console.log("Starting seed operation...")

    // Check if buyers already exist
    const { data: existingBuyers, error: checkError } = await supabase
      .from("buyers") // Correct table name
      .select("name")
      .in(
        "name",
        initialBuyers.map((b) => b.name),
      )

    if (checkError) {
      console.error("Error checking existing buyers:", checkError)
      return { success: false, error: checkError.message }
    }

    // Filter out buyers that already exist
    const existingNames = existingBuyers?.map((b) => b.name) || []
    const buyersToInsert = initialBuyers.filter((b) => !existingNames.includes(b.name))

    console.log(`Found ${existingNames.length} existing buyers, ${buyersToInsert.length} to insert`)

    if (buyersToInsert.length === 0) {
      return { success: true, message: "All buyers already exist in the database" }
    }

    // Insert new buyers
    const { error: insertError } = await supabase
      .from("buyers") // Correct table name
      .insert(buyersToInsert)

    if (insertError) {
      console.error("Error inserting buyers:", insertError)
      return { success: false, error: insertError.message }
    }

    console.log(`Successfully added ${buyersToInsert.length} buyers to the database`)

    return {
      success: true,
      message: `Successfully added ${buyersToInsert.length} buyers to the database`,
    }
  } catch (error) {
    console.error("Unexpected error seeding buyers:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

