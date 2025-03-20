"use client"

import { useMemo } from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeadsTableSkeleton } from "@/components/leads/leads-table-skeleton"
import type { Lead } from "@/types/lead"

interface LeadsTableProps {
  leads: Lead[]
  isLoading: boolean
}

/**
 * Table component for displaying leads data
 */
export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  // Memoize the badge variant calculation to avoid recalculating on every render
  const getBadgeVariant = useMemo(
    () => (status: string) => {
      switch (status) {
        case "Active":
          return "default" // Primary (navy)
        case "Contacted":
          return "secondary" // Light blue
        case "Negotiation":
          return "outline"
        default:
          return "destructive" // Red
      }
    },
    [],
  )

  if (isLoading) {
    return <LeadsTableSkeleton />
  }

  return (
    <Table>
      <TableHeader className="bg-british-navy text-white">
        <TableRow>
          <TableHead className="w-[50px] text-white">
            <Checkbox className="border-white" />
          </TableHead>
          <TableHead className="text-white">Company</TableHead>
          <TableHead className="text-white">Contact</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white">Last Contact</TableHead>
          <TableHead className="text-white">Value</TableHead>
          <TableHead className="w-[100px] text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
              No leads found
            </TableCell>
          </TableRow>
        ) : (
          leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{lead.company}</TableCell>
              <TableCell>{lead.contact}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(lead.status)}>{lead.status}</Badge>
              </TableCell>
              <TableCell>{lead.lastContact}</TableCell>
              <TableCell>{lead.value}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Open menu</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-british-red">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

