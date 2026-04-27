'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowRight, HelpCircle } from 'lucide-react'
import {
  TRAINING_THEME_OPTIONS,
  getTrainingThemeLabel,
  type TrainingTheme,
} from '@/lib/chess/training-themes'

interface CreatePuzzleSetFormProps {
  userRating: number
  onSubmit: (data: {
    name: string
    targetRating: number
    ratingRange: number
    size: number
    targetCycles: number
    focusTheme: TrainingTheme | null
  }) => void
  isSubmitting?: boolean
}

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
  const anyThemeValue = 'any-theme'
  const [name, setName] = useState('My Training Set')
  const [useRecommendedRatingLimit, setUseRecommendedRatingLimit] = useState(true)
  const [targetRating, setTargetRating] = useState(Math.max(800, userRating - 200))
  const [ratingRange, setRatingRange] = useState(200)
  const [size, setSize] = useState(150)
  const [targetCycles, setTargetCycles] = useState(5)
  const [focusTheme, setFocusTheme] = useState<TrainingTheme | null>(null)

  const recommendedMaxRating = useMemo(
    () => Math.max(800, Math.min(2400, userRating + 100)),
    [userRating]
  )
  const targetRatingMax = useRecommendedRatingLimit ? recommendedMaxRating : 2600
  const minRating = useMemo(() => Math.max(800, targetRating - ratingRange / 2), [targetRating, ratingRange])
  const maxRating = useMemo(() => Math.min(2600, targetRating + ratingRange / 2), [targetRating, ratingRange])

  const handleRecommendedRatingLimitChange = useCallback((checked: boolean) => {
    setUseRecommendedRatingLimit(checked)
    if (checked) {
      setTargetRating((current) => Math.min(current, recommendedMaxRating))
    }
  }, [recommendedMaxRating])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      targetRating,
      ratingRange,
      size,
      targetCycles,
      focusTheme,
    })
  }, [name, targetRating, ratingRange, size, targetCycles, focusTheme, onSubmit])

  const getDifficultyLabel = (): string => {
    const diff = userRating - targetRating
    if (diff >= 300) return 'Easy (confidence building)'
    if (diff >= 150) return 'Comfortable (recommended)'
    if (diff >= 0) return 'Challenging'
    return 'Very hard (not recommended)'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
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

          {/* Theme Focus */}
          <div className="space-y-3">
            <Label htmlFor="theme-focus">Theme focus</Label>
            <Select
              value={focusTheme ?? anyThemeValue}
              onValueChange={(value) => {
                setFocusTheme(value === anyThemeValue ? null : (value as TrainingTheme))
              }}
            >
              <SelectTrigger id="theme-focus" className="w-full">
                <SelectValue placeholder="Any theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={anyThemeValue}>Any theme</SelectItem>
                {TRAINING_THEME_OPTIONS.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional. Pick one tactical motif to build a focused set for weakness training.
            </p>
          </div>

          {/* Target Rating */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label>Target puzzle rating</Label>
                <div className="mt-1.5 flex h-6 items-center gap-2">
                  <Switch
                    id="recommended-rating-limit"
                    checked={useRecommendedRatingLimit}
                    onCheckedChange={handleRecommendedRatingLimitChange}
                  />
                  <Label
                    htmlFor="recommended-rating-limit"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Recommended range
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-full p-0 text-muted-foreground shadow-none hover:text-foreground"
                        aria-label="Recommended range details"
                      >
                        <HelpCircle className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      Uses your entered rating to set a recommended target
                      range. Turn it off to choose any rating from 800-2600.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <span className="text-sm font-medium tabular-nums">{targetRating}</span>
            </div>
            <Slider
              value={[targetRating]}
              onValueChange={([value]) => setTargetRating(value)}
              min={800}
              max={targetRatingMax}
              step={25}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>800</span>
              <span className="font-medium">{getDifficultyLabel()}</span>
              <span>{targetRatingMax}</span>
            </div>
            <p className="h-4 text-xs leading-4 text-muted-foreground">
              {useRecommendedRatingLimit
                ? `Recommended for your ${userRating} rating.`
                : '\u00A0'}
            </p>
          </div>

          {/* Rating Range */}
          <div className="!mt-5 space-y-4">
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
            <div className="flex items-center justify-between">
              <Label>Set size</Label>
              <span className="text-sm font-medium tabular-nums">{size} puzzles</span>
            </div>
            <Slider
              value={[size]}
              onValueChange={([value]) => setSize(value)}
              min={50}
              max={500}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Flexible size from 50 to 500 puzzles.
            </p>
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200"
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
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Theme focus</span>
              <span className="font-medium">{getTrainingThemeLabel(focusTheme)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total training time estimate</span>
              <span className="font-medium">
                {Math.round((size * 0.5 * targetCycles) / 60)} - {Math.round((size * 1.5 * targetCycles) / 60)} hours
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full gap-2 rounded-xl h-12 text-base transition-transform active:scale-[0.98] shadow-md shadow-primary/20" size="lg" disabled={isSubmitting}>
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
