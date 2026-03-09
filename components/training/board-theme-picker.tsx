'use client'

import { useId } from 'react'
import { Check } from 'lucide-react'
import {
  BOARD_THEME_OPTIONS,
  resolveBoardTheme,
  type BoardThemeId,
} from '@/lib/chess/board-themes'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface BoardThemePickerProps {
  value?: string | null
  onValueChange: (value: BoardThemeId) => void
  disabled?: boolean
  compact?: boolean
  className?: string
}

export function BoardThemePicker({
  value,
  onValueChange,
  disabled = false,
  compact = false,
  className,
}: BoardThemePickerProps) {
  const baseId = useId()
  const selectedTheme = resolveBoardTheme(value)

  return (
    <RadioGroup
      value={selectedTheme}
      onValueChange={(nextValue) => onValueChange(resolveBoardTheme(nextValue))}
      disabled={disabled}
      className={cn(
        compact ? 'grid grid-cols-2 gap-2' : 'grid gap-3 md:grid-cols-2',
        className
      )}
    >
      {BOARD_THEME_OPTIONS.map((theme) => {
        const optionId = `${baseId}-${theme.id}`
        const isSelected = selectedTheme === theme.id

        return (
          <label
            key={theme.id}
            htmlFor={optionId}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-accent/30',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <RadioGroupItem
              id={optionId}
              value={theme.id}
              className="mt-1"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{theme.label}</div>
                  {!compact && (
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-md border border-black/10 shadow-sm"
                  style={{ backgroundColor: theme.lightSquareColor }}
                  aria-hidden="true"
                />
                <span
                  className="h-8 w-8 rounded-md border border-black/10 shadow-sm"
                  style={{ backgroundColor: theme.darkSquareColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </label>
        )
      })}
    </RadioGroup>
  )
}
