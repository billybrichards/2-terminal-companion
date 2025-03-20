"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { year: "2019", voluntary: 104, compliance: 215 },
  { year: "2020", voluntary: 126, compliance: 198 },
  { year: "2021", voluntary: 162, compliance: 245 },
  { year: "2022", voluntary: 188, compliance: 267 },
  { year: "2023", voluntary: 217, compliance: 298 },
]

export function MarketTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Volume Trends</CardTitle>
        <CardDescription>Voluntary vs. compliance market volumes (million tCO₂e)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}M tCO₂e`, ""]}
                contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="voluntary" name="Voluntary Market" fill="#003366" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compliance" name="Compliance Market" fill="#99ccff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

