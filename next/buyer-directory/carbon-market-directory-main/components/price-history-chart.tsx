"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function PriceHistoryChart() {
  const data = [
    { month: "Jan", price: 12.5 },
    { month: "Feb", price: 13.1 },
    { month: "Mar", price: 13.8 },
    { month: "Apr", price: 14.2 },
    { month: "May", price: 14.5 },
    { month: "Jun", price: 14.9 },
    { month: "Jul", price: 15.1 },
    { month: "Aug", price: 15.0 },
    { month: "Sep", price: 14.8 },
    { month: "Oct", price: 15.2 },
    { month: "Nov", price: 15.5 },
    { month: "Dec", price: 15.3 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value: number) => [`$${value}`, "Price"]} labelFormatter={(label) => `Month: ${label}`} />
        <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

