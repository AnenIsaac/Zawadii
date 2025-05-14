"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useMemo } from "react"

// Sample data - in a real app, this would come from an API
const monthlyData = [
  { name: "JAN", value: 100 },
  { name: "FEB", value: 120 },
  { name: "MAR", value: 180 },
  { name: "APR", value: 220 },
  { name: "MAY", value: 200 },
  { name: "JUN", value: 250 },
  { name: "JUL", value: 280 },
  { name: "AUG", value: 320 },
  { name: "SEP", value: 350 },
  { name: "OCT", value: 300 },
  { name: "NOV", value: 200 },
  { name: "DEC", value: 300 },
]

const weeklyData = [
  { name: "MON", value: 45 },
  { name: "TUE", value: 52 },
  { name: "WED", value: 38 },
  { name: "THU", value: 65 },
  { name: "FRI", value: 72 },
  { name: "SAT", value: 85 },
  { name: "SUN", value: 60 },
]

const dailyData = [
  { name: "00:00", value: 5 },
  { name: "03:00", value: 2 },
  { name: "06:00", value: 3 },
  { name: "09:00", value: 15 },
  { name: "12:00", value: 25 },
  { name: "15:00", value: 20 },
  { name: "18:00", value: 30 },
  { name: "21:00", value: 15 },
]

interface ActivityChartProps {
  timeFrame: "Month" | "Week" | "Day"
}

export function ActivityChart({ timeFrame }: ActivityChartProps) {
  const data = useMemo(() => {
    switch (timeFrame) {
      case "Month":
        return monthlyData
      case "Week":
        return weeklyData
      case "Day":
        return dailyData
      default:
        return monthlyData
    }
  }, [timeFrame])

  const barSize = useMemo(() => {
    switch (timeFrame) {
      case "Month":
        return 40
      case "Week":
        return 50
      case "Day":
        return 30
      default:
        return 40
    }
  }, [timeFrame])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barSize={barSize}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tick={{ textAnchor: 'middle' }}
          interval={0}
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`} 
        />
        <Bar 
          dataKey="value" 
          fill="#F8843A" 
          radius={[4, 4, 0, 0]}
          className="hover:opacity-80 transition-opacity"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
