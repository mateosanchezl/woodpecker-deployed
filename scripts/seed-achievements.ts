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
