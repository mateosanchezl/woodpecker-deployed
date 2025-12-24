'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import type { CycleStats } from '@/lib/validations/progress'

interface AccuracyChartProps {
  cycles: CycleStats[]
}

export function AccuracyChart({ cycles }: AccuracyChartProps) {
  const data = cycles.map((c) => ({
    cycle: `Cycle ${c.cycleNumber}`,
    cycleNumber: c.cycleNumber,
    accuracy: c.accuracy,
    correct: c.solvedCorrect,
    incorrect: c.solvedIncorrect,
    skipped: c.skipped,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-1.5">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            Accuracy by Cycle
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-emerald-100 p-1.5">
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          Accuracy by Cycle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="cycle"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                isAnimationActive={false}
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-sm">
                        <p className="font-medium">{data.cycle}</p>
                        <p className="text-emerald-600">Correct: {data.correct}</p>
                        <p className="text-rose-500">Incorrect: {data.incorrect}</p>
                        {data.skipped > 0 && (
                          <p className="text-muted-foreground">Skipped: {data.skipped}</p>
                        )}
                        <p className="font-semibold mt-1">{data.accuracy}% accuracy</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.accuracy >= 90
                        ? 'hsl(160 60% 45%)'
                        : entry.accuracy >= 70
                          ? 'hsl(45 90% 50%)'
                          : 'hsl(0 70% 55%)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
