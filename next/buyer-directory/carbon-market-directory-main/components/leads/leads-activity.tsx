import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Component for displaying recent lead activity
 */
export function LeadsActivity() {
  const activities = [
    {
      id: 1,
      title: "Email sent to Microsoft",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "Call with Delta Air Lines",
      timestamp: "Yesterday",
    },
    {
      id: 3,
      title: "Meeting scheduled with Shell",
      timestamp: "2 days ago",
    },
  ]

  return (
    <Card className="mt-6 bg-british-lightBlue">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest lead interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="font-medium">{activity.title}</div>
              <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-white hover:bg-gray-100">
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  )
}

