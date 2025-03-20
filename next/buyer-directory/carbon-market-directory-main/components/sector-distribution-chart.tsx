"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function SectorDistributionChart() {
  const data = [
    { name: "Energy", value: 28 },
    { name: "Technology", value: 22 },
    { name: "Finance", value: 18 },
    { name: "Aviation", value: 12 },
    { name: "Retail", value: 10 },
    { name: "Other", value: 10 },
  ]

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.2)",
    "hsl(var(--muted))",
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
          labelLine={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} labelFormatter={(label) => `${label}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

