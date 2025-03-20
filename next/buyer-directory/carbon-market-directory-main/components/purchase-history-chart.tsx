"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface PurchaseHistoryChartProps {
  data: Array<{
    year: string
    volume: number
  }>
}

export function PurchaseHistoryChart({ data }: PurchaseHistoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}M`}
        />
        <Tooltip
          formatter={(value: number) => [`${value}M tCO₂e`, "Volume"]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

