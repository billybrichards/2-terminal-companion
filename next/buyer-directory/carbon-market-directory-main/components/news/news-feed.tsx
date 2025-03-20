/**
 * News Feed Component
 *
 * This component displays news items from various RSS feeds related to carbon markets
 * and environmental topics. It provides filtering by source and search functionality.
 *
 * @component
 */

"use client"

import { useState } from "react"
import { Calendar, ExternalLink, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type FeedItem, cleanDescription } from "@/lib/rss"
import { formatDistanceToNow } from "date-fns"

/**
 * Props for the NewsFeed component
 */
interface NewsFeedProps {
  /** Array of feed items to display */
  items: FeedItem[]
}

/**
 * NewsFeed component
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function NewsFeed({ items }: NewsFeedProps) {
  // State for search term and active tab
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // If there are no items, show a message
  if (items.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load news</AlertTitle>
        <AlertDescription>
          We're having trouble loading the latest carbon market news. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Get unique sources for tabs
  const sources = ["all", ...new Set(items.map((item) => item.sourceName))]

  // Filter items based on search term and active tab
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleanDescription(item.description).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || item.sourceName === activeTab

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search news..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-nowrap overflow-x-auto">
          {sources.map((source) => (
            <TabsTrigger key={source} value={source} className="whitespace-nowrap">
              {source === "all" ? "All Sources" : source}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No news items found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => <NewsItem key={item.id} item={item} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * NewsItem component for displaying a single news item
 *
 * @param props - Component props
 * @returns JSX.Element
 */
function NewsItem({ item }: { item: FeedItem }) {
  const description = cleanDescription(item.description)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {item.image && (
            <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image on error
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">
                {item.sourceName}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {typeof item.published === "number"
                  ? formatDistanceToNow(new Date(item.published), { addSuffix: true })
                  : "Recently"}
              </div>
            </div>
            <h3 className="font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <div className="flex justify-end">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Read More
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

