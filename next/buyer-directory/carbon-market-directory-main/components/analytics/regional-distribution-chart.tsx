"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "North America", value: 35 },
  { name: "Europe", value: 30 },
  { name: "Asia Pacific", value: 20 },
  { name: "Latin America", value: 10 },
  { name: "Africa", value: 5 },
]

const COLORS = [
  "#003366", // british-navy
  "#1a4d80",
  "#336699",
  "#4d80b3",
  "#6699cc",
]

export function RegionalDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Distribution</CardTitle>
        <CardDescription>Carbon credit buyers by region</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Percentage"]}
                contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}
              />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

