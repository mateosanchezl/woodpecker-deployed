'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, Zap, Brain, Target, Repeat } from 'lucide-react'

interface OnboardingWizardProps {
  onComplete: (data: { estimatedRating: number }) => void
  isSubmitting?: boolean
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Woodpecker',
  },
  {
    id: 'method',
    title: 'The Method',
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
  },
  {
    id: 'rating',
    title: 'Your Level',
  },
]

export function OnboardingWizard({ onComplete, isSubmitting }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [estimatedRating, setEstimatedRating] = useState(1200)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    onComplete({ estimatedRating })
  }, [onComplete, estimatedRating])

  const getRatingLabel = (rating: number): string => {
    if (rating < 1000) return 'Beginner'
    if (rating < 1200) return 'Casual'
    if (rating < 1400) return 'Club Player'
    if (rating < 1600) return 'Intermediate'
    if (rating < 1800) return 'Advanced'
    if (rating < 2000) return 'Expert'
    if (rating < 2200) return 'Candidate Master'
    return 'Master'
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Progress value={progress} className="h-1 mb-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && <MethodStep />}
            {currentStep === 2 && <HowItWorksStep />}
            {currentStep === 3 && (
              <RatingStep
                rating={estimatedRating}
                onRatingChange={setEstimatedRating}
                ratingLabel={getRatingLabel(estimatedRating)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? 'Setting up...' : 'Get Started'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-50 mb-4">
        <span className="text-3xl font-bold text-white dark:text-zinc-900">W</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        You&apos;re about to train differently.
      </h1>

      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
        Most chess players solve thousands of puzzles and wonder why they don&apos;t improve.
        The problem isn&apos;t the puzzles—it&apos;s the approach.
      </p>

      <p className="text-muted-foreground">
        Woodpecker uses a method trusted by grandmasters to build real tactical intuition.
      </p>
    </div>
  )
}

function MethodStep() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Repetition builds intuition.
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          The Woodpecker Method was developed by GM Axel Smith and GM Hans Tikkanen.
          It&apos;s based on a simple observation: masters don&apos;t calculate every move—they
          <span className="text-foreground font-medium"> recognize patterns instantly</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Traditional approach</h3>
                <p className="text-sm text-muted-foreground">
                  Solve many puzzles once. Forget them. Wonder why you miss the same
                  patterns in games.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Repeat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Woodpecker approach</h3>
                <p className="text-sm text-muted-foreground">
                  Solve the same puzzles repeatedly. Each cycle faster.
                  Patterns become automatic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HowItWorksStep() {
  const steps = [
    {
      icon: Target,
      title: 'Curated set',
      description: 'We build a personalized puzzle set slightly below your level—hard enough to challenge, easy enough to internalize.',
    },
    {
      icon: Repeat,
      title: 'Multiple cycles',
      description: 'You solve the entire set multiple times. By cycle 3 or 4, you\'ll recognize patterns before consciously calculating.',
    },
    {
      icon: Zap,
      title: 'Speed increases',
      description: 'Each cycle gets faster as recognition replaces calculation. That\'s the skill transferring to real games.',
    },
    {
      icon: Brain,
      title: 'Intuition develops',
      description: 'Tactical motifs—pins, forks, deflections—become second nature. You see them instantly, even under time pressure.',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How Woodpecker works
        </h2>
        <p className="text-muted-foreground">
          A systematic approach to building pattern recognition.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <step.icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RatingStepProps {
  rating: number
  onRatingChange: (rating: number) => void
  ratingLabel: string
}

function RatingStep({ rating, onRatingChange, ratingLabel }: RatingStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          What&apos;s your current level?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This helps us calibrate your first puzzle set. Don&apos;t worry about being
          precise—we&apos;ll adjust as you train.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">{rating}</div>
            <div className="text-muted-foreground mt-1">{ratingLabel}</div>
          </div>

          <div className="space-y-4">
            <Label>Estimated rating (Lichess/Chess.com)</Label>
            <Slider
              value={[rating]}
              onValueChange={([value]) => onRatingChange(value)}
              min={800}
              max={2400}
              step={50}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>800</span>
              <span>1200</span>
              <span>1600</span>
              <span>2000</span>
              <span>2400</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Use your rating from Lichess, Chess.com, or over-the-board play.
            If unsure, start lower—it&apos;s better to build confidence first.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
