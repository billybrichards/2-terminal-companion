import { CalendarIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewsFeed() {
  const newsItems = [
    {
      id: 1,
      title: "Microsoft announces largest-ever carbon removal deal",
      source: "Carbon Pulse",
      date: "2 days ago",
      url: "#",
    },
    {
      id: 2,
      title: "New report shows 40% growth in voluntary carbon market",
      source: "Environmental Finance",
      date: "4 days ago",
      url: "#",
    },
    {
      id: 3,
      title: "Shell increases investment in nature-based solutions",
      source: "Reuters",
      date: "1 week ago",
      url: "#",
    },
    {
      id: 4,
      title: "EU carbon border tax to impact global trade patterns",
      source: "Bloomberg",
      date: "1 week ago",
      url: "#",
    },
    {
      id: 5,
      title: "Aviation industry commits to net-zero by 2050",
      source: "Climate Home News",
      date: "2 weeks ago",
      url: "#",
    },
  ]

  return (
    <div className="space-y-4">
      {newsItems.map((item) => (
        <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
          <h3 className="font-medium mb-1">{item.title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{item.source}</span>
              <span>•</span>
              <span className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {item.date}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-3 w-3" />
              <span className="sr-only">Read more</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

