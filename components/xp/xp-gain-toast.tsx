'use client'

interface XpBreakdownItemInput {
  source: string
  amount: number
  label: string
}

/**
 * XP breakdown component for detailed display in cycle summary
 */
export function XpBreakdown({
  breakdown,
}: {
  breakdown: XpBreakdownItemInput[]
}) {
  if (breakdown.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5">
      {breakdown.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium text-primary">+{item.amount}</span>
        </div>
      ))}
    </div>
  )
}
