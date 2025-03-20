"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan 2023", price: 12.5 },
  { month: "Feb 2023", price: 13.1 },
  { month: "Mar 2023", price: 13.8 },
  { month: "Apr 2023", price: 14.2 },
  { month: "May 2023", price: 14.5 },
  { month: "Jun 2023", price: 14.9 },
  { month: "Jul 2023", price: 15.1 },
  { month: "Aug 2023", price: 15.0 },
  { month: "Sep 2023", price: 14.8 },
  { month: "Oct 2023", price: 15.2 },
  { month: "Nov 2023", price: 15.5 },
  { month: "Dec 2023", price: 15.3 },
  { month: "Jan 2024", price: 15.7 },
  { month: "Feb 2024", price: 16.2 },
  { month: "Mar 2024", price: 15.9 },
]

export function CarbonPriceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Credit Price Trends</CardTitle>
        <CardDescription>Average price per tonne CO₂e over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ angle: -45, textAnchor: "end", dy: 10 }}
                height={60}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, "Price"]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#003366"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#003366", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

