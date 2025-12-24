'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import type { ThemePerformance } from '@/lib/validations/progress'

interface ThemeChartProps {
  themes: ThemePerformance[]
}

// Format theme names for display (camelCase to Title Case)
function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

const COLORS = [
  'hsl(160 60% 45%)',   // Emerald
  'hsl(280 60% 55%)',   // Violet
  'hsl(200 80% 50%)',   // Sky blue
  'hsl(35 90% 55%)',    // Amber
  'hsl(340 70% 55%)',   // Rose
  'hsl(170 60% 45%)',   // Teal
  'hsl(260 60% 55%)',   // Purple
  'hsl(20 80% 55%)',    // Orange
]

export function ThemeChart({ themes }: ThemeChartProps) {
  if (themes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-sky-100 p-1.5">
              <Layers className="h-4 w-4 text-sky-600" />
            </div>
            Theme Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            No theme data yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = themes.slice(0, 8).map((t) => ({
    name: formatTheme(t.theme),
    value: t.totalAttempts,
    accuracy: t.accuracy,
    correct: t.correctAttempts,
    total: t.totalAttempts,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-sky-100 p-1.5">
            <Layers className="h-4 w-4 text-sky-600" />
          </div>
          Theme Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Chart */}
          <div className="h-[200px] w-[200px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-sm">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-muted-foreground">
                            {data.correct}/{data.total} correct
                          </p>
                          <p
                            className={
                              data.accuracy >= 80
                                ? 'text-emerald-600'
                                : data.accuracy >= 60
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                            }
                          >
                            {data.accuracy}% accuracy
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className={`text-xs tabular-nums ${
                    item.accuracy >= 80
                      ? 'text-emerald-600'
                      : item.accuracy >= 60
                        ? 'text-amber-600'
                        : 'text-rose-600'
                  }`}>
                    {item.accuracy}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
