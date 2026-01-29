import 'dotenv/config'
import { prisma } from '@/lib/prisma'

const ACHIEVEMENTS = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first puzzle',
    category: 'puzzles',
    icon: '🎯',
    sortOrder: 1,
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Solve 100 puzzles',
    category: 'puzzles',
    icon: '💯',
    sortOrder: 2,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Solve a puzzle in under 3 seconds',
    category: 'speed',
    icon: '⚡',
    sortOrder: 10,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a cycle with 100% accuracy',
    category: 'cycles',
    icon: '✨',
    sortOrder: 20,
  },
  {
    id: 'woodpecker-pro',
    name: 'Woodpecker Pro',
    description: 'Complete 5 cycles of the same set',
    category: 'cycles',
    icon: '🪶',
    sortOrder: 21,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Practice before 7am',
    category: 'time',
    icon: '🌅',
    sortOrder: 30,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Practice after midnight',
    category: 'time',
    icon: '🦉',
    sortOrder: 31,
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Reach a 7-day streak',
    category: 'streaks',
    icon: '🔥',
    sortOrder: 40,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach a 30-day streak',
    category: 'streaks',
    icon: '🚀',
    sortOrder: 41,
  },
  {
    id: 'theme-master-fork',
    name: 'Theme Master: Forks',
    description: '90%+ accuracy on fork puzzles (min 20 attempts)',
    category: 'themes',
    icon: '🍴',
    sortOrder: 50,
  },
  // NEW ACHIEVEMENTS
  {
    id: 'half-thousand',
    name: 'Half Thousand',
    description: 'Solve 500 puzzles correctly',
    category: 'puzzles',
    icon: '🎖️',
    sortOrder: 3,
  },
  {
    id: 'millennium',
    name: 'Millennium',
    description: 'Solve 1000 puzzles correctly',
    category: 'puzzles',
    icon: '👑',
    sortOrder: 4,
  },
  {
    id: 'weekly-warrior',
    name: 'Weekly Warrior',
    description: 'Solve 100 puzzles in a single week',
    category: 'puzzles',
    icon: '📅',
    sortOrder: 5,
  },
  {
    id: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Solve a puzzle in under 1.5 seconds',
    category: 'speed',
    icon: '⚡',
    sortOrder: 11,
  },
  {
    id: 'speed-streak',
    name: 'Speed Streak',
    description: 'Solve 10 consecutive puzzles in under 5 seconds each',
    category: 'speed',
    icon: '💨',
    sortOrder: 12,
  },
  {
    id: 'cycle-complete',
    name: 'Cycle Complete',
    description: 'Complete your first full cycle',
    category: 'cycles',
    icon: '♻️',
    sortOrder: 22,
  },
  {
    id: 'woodpecker-master',
    name: 'Woodpecker Master',
    description: 'Complete 10 cycles of the same set',
    category: 'cycles',
    icon: '🏆',
    sortOrder: 23,
  },
  {
    id: 'improvement-king',
    name: 'Improvement King',
    description: 'Reduce cycle completion time by 50% compared to first cycle',
    category: 'cycles',
    icon: '📈',
    sortOrder: 24,
  },
  {
    id: 'consistent-trainer',
    name: 'Consistent Trainer',
    description: 'Train for 14 consecutive days',
    category: 'streaks',
    icon: '💪',
    sortOrder: 42,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Train for 60 consecutive days',
    category: 'streaks',
    icon: '🔱',
    sortOrder: 43,
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: 'Maintain 95% accuracy over 50 puzzles in a cycle',
    category: 'accuracy',
    icon: '🎯',
    sortOrder: 60,
  },
  {
    id: 'flawless-streak',
    name: 'Flawless Streak',
    description: 'Solve 25 consecutive puzzles correctly',
    category: 'accuracy',
    icon: '✅',
    sortOrder: 61,
  },
  {
    id: 'no-mistakes',
    name: 'No Mistakes',
    description: 'Complete a full cycle without a single error (min 20 puzzles)',
    category: 'accuracy',
    icon: '💎',
    sortOrder: 62,
  },
  {
    id: 'theme-master-pin',
    name: 'Theme Master: Pins',
    description: '90%+ accuracy on pin puzzles (min 20 attempts)',
    category: 'themes',
    icon: '📌',
    sortOrder: 51,
  },
  {
    id: 'theme-master-skewer',
    name: 'Theme Master: Skewers',
    description: '90%+ accuracy on skewer puzzles (min 20 attempts)',
    category: 'themes',
    icon: '🗡️',
    sortOrder: 52,
  },
  {
    id: 'mate-master',
    name: 'Mate Master',
    description: '90%+ accuracy on checkmate puzzles (min 30 attempts)',
    category: 'themes',
    icon: '♟️',
    sortOrder: 53,
  },
  {
    id: 'tactical-prodigy',
    name: 'Tactical Prodigy',
    description: 'Achieve 85%+ accuracy across 200 total attempts',
    category: 'mastery',
    icon: '🧠',
    sortOrder: 70,
  },
  {
    id: 'rating-climber',
    name: 'Rating Climber',
    description: 'Solve 50 puzzles with rating 1800+',
    category: 'mastery',
    icon: '📊',
    sortOrder: 71,
  },
  {
    id: 'versatile',
    name: 'Versatile',
    description: 'Solve puzzles from 5 different tactical themes with 80%+ accuracy (min 15 each)',
    category: 'mastery',
    icon: '🎨',
    sortOrder: 72,
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach top 100 on the weekly leaderboard',
    category: 'leaderboard',
    icon: '⭐',
    sortOrder: 80,
  },
]

async function seedAchievements() {
  console.log('Seeding achievements...')

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    })
    console.log(`  ✓ ${achievement.name}`)
  }

  console.log('')
  console.log(`Successfully seeded ${ACHIEVEMENTS.length} achievements!`)
}

seedAchievements()
  .then(() => {
    console.log('\nSeed script finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nSeed script failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
