/**
 * RSS Feed Integration Module
 *
 * This module provides functionality to fetch and process RSS feeds from various sources
 * related to carbon markets and environmental news. It uses the rss-to-json library to
 * parse RSS feeds and provides fallback mechanisms in case of failures.
 *
 * @module lib/rss
 */

// Fix the import to use the parse function directly
import { parse } from "rss-to-json"

/**
 * Represents a single item from an RSS feed
 */
export interface FeedItem {
  /** Unique identifier for the feed item */
  id: string
  /** Title of the news item */
  title: string
  /** Description or content of the news item */
  description: string
  /** URL to the full article */
  link: string
  /** Publication timestamp in milliseconds */
  published: number
  /** Creation timestamp in milliseconds */
  created: number
  /** Categories or tags associated with the item */
  category: string[]
  /** URL of the RSS feed source */
  source: string
  /** Human-readable name of the source */
  sourceName: string
  /** Optional URL to an image associated with the item */
  image?: string
}

/**
 * Represents a complete RSS feed
 */
export interface Feed {
  /** Title of the feed */
  title: string
  /** Description of the feed */
  description: string
  /** URL to the feed's website */
  link: string
  /** Optional URL to the feed's logo */
  image?: string
  /** Array of feed items */
  items: FeedItem[]
}

/**
 * Configuration for RSS feeds to fetch
 * Each entry contains a URL and a human-readable name
 */
const RSS_FEEDS = [
  {
    url: "https://www.green.earth/blog/rss.xml",
    name: "Green Earth",
  },
  {
    url: "https://carbon-pulse.com/feed/",
    name: "Carbon Pulse",
  },
  {
    url: "https://www.carbonbrief.org/feed/",
    name: "Carbon Brief",
  },
  {
    url: "https://cleantechnica.com/feed/",
    name: "CleanTechnica",
  },
  {
    url: "https://www.edie.net/feed/",
    name: "Edie",
  },
]

/**
 * Fetches and processes a single RSS feed
 *
 * @param feedUrl - URL of the RSS feed to fetch
 * @param sourceName - Human-readable name of the source
 * @returns Promise resolving to an array of feed items
 */
async function fetchFeed(feedUrl: string, sourceName: string): Promise<FeedItem[]> {
  try {
    console.log(`Fetching feed from ${feedUrl}...`)

    // Use the correct parse function directly
    const feed = await parse(feedUrl)

    console.log(`Successfully fetched feed from ${feedUrl}`)

    // Map the feed items to our standardized format
    return feed.items.map((item) => ({
      id: item.id || item.guid || item.link,
      title: item.title,
      description: item.description || item.content || item.summary || "",
      link: item.link || item.url,
      published: item.published || item.pubDate || Date.now(),
      created: item.created || item.pubDate || Date.now(),
      category: item.category || [],
      source: feedUrl,
      sourceName: sourceName,
      image: item.image || item.enclosures?.[0]?.url || null,
    }))
  } catch (error) {
    console.error(`Error fetching feed ${feedUrl}:`, error)
    return []
  }
}

/**
 * Fetches and aggregates items from all configured RSS feeds
 *
 * @returns Promise resolving to an array of feed items from all sources
 */
export async function fetchAllFeeds(): Promise<FeedItem[]> {
  try {
    // Create a fallback array of mock news items in case all feeds fail
    const mockItems: FeedItem[] = [
      {
        id: "mock-1",
        title: "Microsoft announces largest-ever carbon removal deal",
        description:
          "Microsoft has signed a deal to purchase 1.5 million metric tons of carbon removal credits over the next decade, marking the largest corporate carbon removal agreement to date.",
        link: "https://example.com/microsoft-carbon-deal",
        published: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        created: Date.now() - 2 * 24 * 60 * 60 * 1000,
        category: ["Carbon Markets", "Technology"],
        source: "mock",
        sourceName: "Carbon Pulse",
      },
      {
        id: "mock-2",
        title: "New report shows 40% growth in voluntary carbon market",
        description:
          "A new report by Environmental Finance indicates that the voluntary carbon market grew by 40% in the past year, with nature-based solutions leading the way.",
        link: "https://example.com/carbon-market-growth",
        published: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        created: Date.now() - 4 * 24 * 60 * 60 * 1000,
        category: ["Carbon Markets", "Research"],
        source: "mock",
        sourceName: "Environmental Finance",
      },
      {
        id: "mock-3",
        title: "EU carbon border tax to impact global trade patterns",
        description:
          "The EU's Carbon Border Adjustment Mechanism (CBAM) is set to significantly impact global trade patterns as countries adapt to new carbon pricing requirements.",
        link: "https://example.com/eu-carbon-tax",
        published: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
        created: Date.now() - 7 * 24 * 60 * 60 * 1000,
        category: ["Policy", "Carbon Markets"],
        source: "mock",
        sourceName: "Carbon Brief",
      },
    ]

    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map((feed) => fetchFeed(feed.url, feed.name))
    const feedsResults = await Promise.allSettled(feedPromises)

    // Combine all feed items
    let allItems: FeedItem[] = []

    feedsResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allItems = [...allItems, ...result.value]
      } else {
        console.error(`Failed to fetch feed ${RSS_FEEDS[index].url}:`, result.reason)
      }
    })

    // If we couldn't fetch any feeds, use mock data
    if (allItems.length === 0) {
      console.warn("No feeds could be fetched. Using mock data instead.")
      allItems = mockItems
    }

    // Sort by published date (newest first)
    allItems.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())

    return allItems
  } catch (error) {
    console.error("Error fetching feeds:", error)
    // Return mock data as fallback
    return [
      {
        id: "fallback-1",
        title: "Carbon Market News Temporarily Unavailable",
        description: "We're experiencing issues fetching the latest carbon market news. Please check back later.",
        link: "#",
        published: Date.now(),
        created: Date.now(),
        category: ["System"],
        source: "fallback",
        sourceName: "System Message",
      },
    ]
  }
}

/**
 * Cleans HTML from a description string
 *
 * @param html - HTML string to clean
 * @returns Plain text with HTML tags removed and entities decoded
 */
export function cleanDescription(html: string): string {
  if (!html) return ""

  // Remove HTML tags
  const text = html.replace(/<\/?[^>]+(>|$)/g, "")
  // Decode HTML entities
  const decoded = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")

  // Truncate to a reasonable length for a summary
  return decoded.length > 200 ? decoded.substring(0, 200) + "..." : decoded
}

/**
 * Extracts the first image URL from HTML content
 *
 * @param content - HTML content to search for images
 * @returns URL of the first image found, or null if none
 */
export function extractImageFromContent(content: string): string | null {
  if (!content) return null

  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const match = imgRegex.exec(content)
  return match ? match[1] : null
}

