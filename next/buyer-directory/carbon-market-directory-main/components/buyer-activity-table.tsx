"use client"

import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BuyerActivity } from "@/types/buyer"

interface BuyerActivityTableProps {
  activities: BuyerActivity[]
}

export function BuyerActivityTable({ activities }: BuyerActivityTableProps) {
  // Activity type to badge variant mapping
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Purchase":
        return "default" // Primary (navy)
      case "Inquiry":
        return "secondary" // Light blue
      case "ProfileUpdate":
        return "outline"
      case "ContactAdded":
        return "default" // Primary (navy)
      case "DocumentUploaded":
        return "outline"
      case "NoteAdded":
        return "secondary" // Light blue
      case "StatusChange":
        return "outline"
      case "MeetingScheduled":
        return "default" // Primary (navy)
      case "EmailSent":
        return "secondary" // Light blue
      case "CallLogged":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-british-navy text-white">
          <TableRow>
            <TableHead className="text-white">Buyer</TableHead>
            <TableHead className="text-white">Activity</TableHead>
            <TableHead className="text-white">Details</TableHead>
            <TableHead className="text-white">Time</TableHead>
            <TableHead className="text-white w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No recent activities found
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.buyerName}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(activity.type)}>{activity.type}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.description}</div>
                    {activity.relatedTo && (
                      <div className="text-xs text-muted-foreground mt-1">Related to: {activity.relatedTo.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

