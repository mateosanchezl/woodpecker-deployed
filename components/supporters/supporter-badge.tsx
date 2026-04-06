'use client'

import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SupporterBadgeProps {
  grantedAt?: string | null
  className?: string
  showLabel?: boolean
  showTooltip?: boolean
}

function formatGrantedAt(grantedAt?: string | null) {
  if (!grantedAt) {
    return null
  }

  return new Date(grantedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function SupporterBadge({
  grantedAt = null,
  className,
  showLabel = true,
  showTooltip = true,
}: SupporterBadgeProps) {
  const formattedGrantedAt = formatGrantedAt(grantedAt)

  const badge = (
    <Badge
      aria-label="Buy Me a Coffee supporter"
      className={cn(
        'rounded-full border border-amber-300/70 bg-linear-to-r from-amber-100 via-orange-100 to-rose-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-sm shadow-amber-500/10 dark:border-amber-300/25 dark:from-amber-400/15 dark:via-orange-400/10 dark:to-rose-400/15 dark:text-amber-100',
        !showLabel && 'px-2',
        className,
      )}
    >
      <Heart className="size-3.5 fill-current" />
      {showLabel ? <span>Supporter</span> : null}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top">
          <div className="space-y-1">
            <p className="font-semibold">Buy Me a Coffee supporter</p>
            <p className="text-xs text-muted-foreground">
              Thanks for helping keep Peck improving.
            </p>
            {formattedGrantedAt ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Granted {formattedGrantedAt}
              </p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
