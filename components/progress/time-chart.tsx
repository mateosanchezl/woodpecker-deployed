'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer } from 'lucide-react'
import type { CycleStats } from '@/lib/validations/progress'

interface TimeChartProps {
  cycles: CycleStats[]
}

function formatMinutes(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  return `${minutes}m`
}

export function TimeChart({ cycles }: TimeChartProps) {
  const data = cycles
    .filter((c) => c.totalTime !== null)
    .map((c) => ({
      cycle: `Cycle ${c.cycleNumber}`,
      cycleNumber: c.cycleNumber,
      time: c.totalTime! / 60000, // Convert to minutes
      rawTime: c.totalTime!,
    }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-violet-100 p-1.5">
              <Timer className="h-4 w-4 text-violet-600" />
            </div>
            Time Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No completed cycles yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxTime = Math.max(...data.map((d) => d.time))
  const yAxisMax = Math.ceil(maxTime / 10) * 10 + 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-violet-100 p-1.5">
            <Timer className="h-4 w-4 text-violet-600" />
          </div>
          Time Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(280 60% 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(280 60% 55%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="cycle"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-sm">
                        <p className="font-medium">{data.cycle}</p>
                        <p className="text-violet-600 font-semibold">
                          {formatMinutes(data.rawTime)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="time"
                stroke="hsl(280 60% 55%)"
                strokeWidth={2.5}
                fill="url(#timeGradient)"
                dot={{ fill: 'hsl(280 60% 55%)', strokeWidth: 2, stroke: 'white', r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
