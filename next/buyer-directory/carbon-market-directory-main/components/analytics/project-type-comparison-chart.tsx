"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { name: "REDD+", value: 28, growth: 15 },
  { name: "Renewable Energy", value: 22, growth: 8 },
  { name: "Reforestation", value: 18, growth: 20 },
  { name: "Direct Air Capture", value: 12, growth: 35 },
  { name: "Soil Carbon", value: 10, growth: 25 },
  { name: "Blue Carbon", value: 10, growth: 40 },
]

export function ProjectTypeComparisonChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Type Comparison</CardTitle>
        <CardDescription>Market share and growth rate by project type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "value") return [`${value}%`, "Market Share"]
                  return [`${value}%`, "YoY Growth"]
                }}
                contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="value" name="Market Share" fill="#003366" radius={[0, 4, 4, 0]} />
              <Bar dataKey="growth" name="YoY Growth" fill="#CF142B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

