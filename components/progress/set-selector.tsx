'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PuzzleSetOption {
  id: string
  name: string
  completedCycles: number
  targetCycles: number
}

interface SetSelectorProps {
  sets: PuzzleSetOption[]
  selectedSetId: string | null
  onSetChange: (setId: string) => void
}

export function SetSelector({ sets, selectedSetId, onSetChange }: SetSelectorProps) {
  if (sets.length === 0) {
    return null
  }

  return (
    <Select value={selectedSetId ?? undefined} onValueChange={onSetChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a puzzle set" />
      </SelectTrigger>
      <SelectContent>
        {sets.map((set) => (
          <SelectItem key={set.id} value={set.id}>
            <span className="flex items-center gap-2">
              <span>{set.name}</span>
              <span className="text-xs text-muted-foreground">
                ({set.completedCycles}/{set.targetCycles} cycles)
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
