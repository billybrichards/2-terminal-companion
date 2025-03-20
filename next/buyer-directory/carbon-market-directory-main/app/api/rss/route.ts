/**
 * RSS Feed API Route
 *
 * This API route fetches and aggregates RSS feeds from various sources
 * related to carbon markets and environmental news.
 *
 * @route GET /api/rss
 * @returns JSON response with feed items
 */

import { NextResponse } from "next/server"
import { fetchAllFeeds } from "@/lib/rss"

/**
 * Handles GET requests to fetch RSS feeds
 *
 * @returns JSON response with feed items or error message
 */
export async function GET() {
  try {
    // Fetch all feeds using the utility function
    const feeds = await fetchAllFeeds()

    // Return the feeds as JSON
    return NextResponse.json({ feeds })
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error in RSS API route:", error)
    return NextResponse.json({ error: "Failed to fetch RSS feeds" }, { status: 500 })
  }
}

