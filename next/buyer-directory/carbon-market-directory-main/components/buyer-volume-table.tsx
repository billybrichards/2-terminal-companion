"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import type { BuyerVolumeMetrics } from "@/types/buyer"

interface BuyerVolumeTableProps {
  volumeData: BuyerVolumeMetrics[]
}

export function BuyerVolumeTable({ volumeData }: BuyerVolumeTableProps) {
  // Format volume with appropriate unit
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M tCO₂e`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K tCO₂e`
    } else {
      return `${volume.toFixed(0)} tCO₂e`
    }
  }

  // Get trend badge color
  const getTrendBadge = (trend: "Increasing" | "Stable" | "Decreasing", change: number) => {
    if (trend === "Increasing") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+{change}%</Badge>
    } else if (trend === "Decreasing") {
      return <Badge className="bg-british-red text-white hover:bg-british-red">-{Math.abs(change)}%</Badge>
    } else {
      return <Badge variant="outline">{change}%</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-british-navy text-white">
          <TableRow>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Company</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white">Industry</TableHead>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Total Volume</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white">Transactions</TableHead>
            <TableHead className="text-white">Project Types</TableHead>
            <TableHead className="text-white">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-white">
                <span>Trend</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-white w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volumeData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No volume data found
              </TableCell>
            </TableRow>
          ) : (
            volumeData.map((data) => (
              <TableRow key={data.buyerId}>
                <TableCell className="font-medium">{data.buyerName}</TableCell>
                <TableCell>{data.buyerIndustry}</TableCell>
                <TableCell>{formatVolume(data.totalVolume)}</TableCell>
                <TableCell>{data.transactionCount}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {data.projectTypeBreakdown.slice(0, 2).map((breakdown, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {breakdown.type}: {breakdown.percentage}%
                      </Badge>
                    ))}
                    {data.projectTypeBreakdown.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.projectTypeBreakdown.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTrendBadge(data.volumeTrend, data.yearOverYearChange)}</TableCell>
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

