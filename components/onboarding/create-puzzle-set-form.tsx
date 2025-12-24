'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, ArrowRight } from 'lucide-react'

interface CreatePuzzleSetFormProps {
  userRating: number
  onSubmit: (data: {
    name: string
    targetRating: number
    ratingRange: number
    size: number
    targetCycles: number
  }) => void
  isSubmitting?: boolean
}

const SIZE_PRESETS = [
  { value: 100, label: '100', description: 'Quick set (~30 min/cycle)' },
  { value: 150, label: '150', description: 'Standard (~45 min/cycle)' },
  { value: 200, label: '200', description: 'Extended (~1 hr/cycle)' },
  { value: 300, label: '300', description: 'Intensive (~1.5 hr/cycle)' },
]

const CYCLE_PRESETS = [
  { value: 3, label: '3 cycles', description: 'Minimum effective' },
  { value: 5, label: '5 cycles', description: 'Recommended' },
  { value: 7, label: '7 cycles', description: 'Deep mastery' },
]

export function CreatePuzzleSetForm({
  userRating,
  onSubmit,
  isSubmitting,
}: CreatePuzzleSetFormProps) {
  const [name, setName] = useState('My Training Set')
  const [targetRating, setTargetRating] = useState(Math.max(800, userRating - 200))
  const [ratingRange, setRatingRange] = useState(200)
  const [size, setSize] = useState(150)
  const [targetCycles, setTargetCycles] = useState(5)

  const minRating = useMemo(() => Math.max(800, targetRating - ratingRange / 2), [targetRating, ratingRange])
  const maxRating = useMemo(() => Math.min(2600, targetRating + ratingRange / 2), [targetRating, ratingRange])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      targetRating,
      ratingRange,
      size,
      targetCycles,
    })
  }, [name, targetRating, ratingRange, size, targetCycles, onSubmit])

  const getDifficultyLabel = (): string => {
    const diff = userRating - targetRating
    if (diff >= 300) return 'Easy (confidence building)'
    if (diff >= 150) return 'Comfortable (recommended)'
    if (diff >= 0) return 'Challenging'
    return 'Very hard (not recommended)'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Your First Puzzle Set</CardTitle>
          <CardDescription>
            Configure your training set. We&apos;ll select high-quality puzzles that match your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Set name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Training Set"
              maxLength={100}
            />
          </div>

          {/* Target Rating */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Target puzzle rating</Label>
              <span className="text-sm font-medium tabular-nums">{targetRating}</span>
            </div>
            <Slider
              value={[targetRating]}
              onValueChange={([value]) => setTargetRating(value)}
              min={800}
              max={Math.min(2400, userRating + 100)}
              step={25}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easier</span>
              <span className="font-medium">{getDifficultyLabel()}</span>
              <span>Harder</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your rating: {userRating}. Puzzles should be slightly below your level for effective pattern building.
            </p>
          </div>

          {/* Rating Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rating range</Label>
              <span className="text-sm text-muted-foreground">
                {minRating} - {maxRating}
              </span>
            </div>
            <Slider
              value={[ratingRange]}
              onValueChange={([value]) => setRatingRange(value)}
              min={100}
              max={400}
              step={50}
            />
            <p className="text-xs text-muted-foreground">
              A wider range provides more variety. A narrower range focuses on a specific difficulty.
            </p>
          </div>

          {/* Set Size */}
          <div className="space-y-4">
            <Label>Set size</Label>
            <RadioGroup
              value={size.toString()}
              onValueChange={(value) => setSize(parseInt(value))}
              className="grid grid-cols-2 gap-4"
            >
              {SIZE_PRESETS.map((preset) => (
                <div key={preset.value}>
                  <RadioGroupItem
                    value={preset.value.toString()}
                    id={`size-${preset.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`size-${preset.value}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="text-lg font-semibold">{preset.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {preset.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Target Cycles */}
          <div className="space-y-4">
            <Label>Training cycles</Label>
            <RadioGroup
              value={targetCycles.toString()}
              onValueChange={(value) => setTargetCycles(parseInt(value))}
              className="grid grid-cols-3 gap-4"
            >
              {CYCLE_PRESETS.map((preset) => (
                <div key={preset.value}>
                  <RadioGroupItem
                    value={preset.value.toString()}
                    id={`cycles-${preset.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`cycles-${preset.value}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">{preset.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {preset.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total training time estimate</span>
            <span className="font-medium">
              {Math.round((size * 0.5 * targetCycles) / 60)} - {Math.round((size * 1.5 * targetCycles) / 60)} hours
            </span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating puzzle set...
          </>
        ) : (
          <>
            Create Set & Start Training
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
