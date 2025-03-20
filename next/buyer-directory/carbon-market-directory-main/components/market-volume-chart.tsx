"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function MarketVolumeChart() {
  const data = [
    { month: "Jan", volume: 2.1 },
    { month: "Feb", volume: 2.3 },
    { month: "Mar", volume: 2.5 },
    { month: "Apr", volume: 2.2 },
    { month: "May", volume: 2.6 },
    { month: "Jun", volume: 2.8 },
    { month: "Jul", volume: 3.0 },
    { month: "Aug", volume: 3.1 },
    { month: "Sep", volume: 3.3 },
    { month: "Oct", volume: 3.5 },
    { month: "Nov", volume: 3.7 },
    { month: "Dec", volume: 3.2 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}M`}
        />
        <Tooltip
          formatter={(value: number) => [`${value}M tCO₂e`, "Volume"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

