/**
 * One-off script: get all unique puzzle themes from the Puzzle table.
 * Run: npx tsx scripts/unique-themes.ts
 */
import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function main() {
  const rows = await prisma.$queryRaw<{ theme: string; count: bigint }[]>`
    SELECT theme, COUNT(*)::bigint AS count
    FROM "Puzzle", unnest(themes) AS theme
    GROUP BY theme
    ORDER BY theme
  `
  console.log('Theme → puzzle count\n')
  for (const r of rows) {
    console.log(`  ${r.theme}: ${Number(r.count)}`)
  }
  console.log(`\nTotal unique themes: ${rows.length}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
