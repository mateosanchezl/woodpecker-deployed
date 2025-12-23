import 'dotenv/config'
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { prisma } from '@/lib/prisma'

// Filtering criteria for high-quality puzzles
const FILTERS = {
  minPopularity: 85,        // Very high quality only
  minNbPlays: 500,          // Well-validated puzzles (stricter)
  maxRatingDeviation: 85,   // Statistically very reliable
  minRating: 800,           // Skip extreme beginner puzzles
  maxRating: 2600,          // Skip extreme expert puzzles
  minMoves: 2,              // No trivial one-movers
  maxMoves: 8               // Woodpecker sweet spot
}

interface CsvRow {
  PuzzleId: string
  FEN: string
  Moves: string
  Rating: string
  RatingDeviation: string
  Popularity: string
  NbPlays: string
  Themes: string
  GameUrl: string
  OpeningTags: string
}

interface PuzzleData {
  id: string
  fen: string
  moves: string
  rating: number
  ratingDeviation: number
  popularity: number
  nbPlays: number
  themes: string[]
  gameUrl: string | null
  openingTags: string[]
  moveCount: number
  difficulty: string
  hasMate: boolean
}

function getRatingDifficulty(rating: number): string {
  if (rating < 1000) return 'beginner'
  if (rating < 1500) return 'intermediate'
  if (rating < 2000) return 'advanced'
  return 'expert'
}

function transformRow(row: CsvRow): PuzzleData | null {
  const rating = parseInt(row.Rating)
  const ratingDeviation = parseInt(row.RatingDeviation)
  const popularity = parseInt(row.Popularity)
  const nbPlays = parseInt(row.NbPlays)
  const moves = row.Moves.trim()
  const moveCount = moves.split(' ').length
  const themes = row.Themes.trim().split(' ').filter(t => t.length > 0)

  return {
    id: row.PuzzleId,
    fen: row.FEN,
    moves,
    rating,
    ratingDeviation,
    popularity,
    nbPlays,
    themes,
    gameUrl: row.GameUrl || null,
    openingTags: row.OpeningTags ? row.OpeningTags.trim().split(' ').filter(t => t.length > 0) : [],
    moveCount,
    difficulty: getRatingDifficulty(rating),
    hasMate: themes.some(t => t.includes('mate') || t.includes('Mate'))
  }
}

function meetsFilterCriteria(puzzle: PuzzleData): boolean {
  return (
    puzzle.popularity >= FILTERS.minPopularity &&
    puzzle.nbPlays >= FILTERS.minNbPlays &&
    puzzle.ratingDeviation <= FILTERS.maxRatingDeviation &&
    puzzle.rating >= FILTERS.minRating &&
    puzzle.rating <= FILTERS.maxRating &&
    puzzle.moveCount >= FILTERS.minMoves &&
    puzzle.moveCount <= FILTERS.maxMoves
  )
}

async function importPuzzles() {
  console.log('Starting puzzle import...')
  console.log('Filter criteria:', FILTERS)
  console.log('')

  const stream = createReadStream('scripts/lichess_db_puzzle.csv')
  const parser = parse({ columns: true })

  let batch: PuzzleData[] = []
  let processedCount = 0
  let insertedCount = 0
  let skippedCount = 0
  const batchSize = 10000

  const startTime = Date.now()

  try {
    for await (const row of stream.pipe(parser)) {
      processedCount++

      // Log progress every 100k rows
      if (processedCount % 100000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        console.log(`Processed: ${processedCount.toLocaleString()} rows (${elapsed}s) | Inserted: ${insertedCount.toLocaleString()} | Skipped: ${skippedCount.toLocaleString()}`)
      }

      const puzzle = transformRow(row as CsvRow)
      if (!puzzle) {
        skippedCount++
        continue
      }

      if (!meetsFilterCriteria(puzzle)) {
        skippedCount++
        continue
      }

      batch.push(puzzle)

      // Insert batch when it reaches the batch size
      if (batch.length >= batchSize) {
        await prisma.puzzle.createMany({
          data: batch,
          skipDuplicates: true
        })
        insertedCount += batch.length
        batch = []
      }
    }

    // Insert final batch
    if (batch.length > 0) {
      await prisma.puzzle.createMany({
        data: batch,
        skipDuplicates: true
      })
      insertedCount += batch.length
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('')
    console.log('='.repeat(60))
    console.log('Import completed!')
    console.log('='.repeat(60))
    console.log(`Total rows processed: ${processedCount.toLocaleString()}`)
    console.log(`Puzzles inserted: ${insertedCount.toLocaleString()}`)
    console.log(`Rows skipped: ${skippedCount.toLocaleString()}`)
    console.log(`Time elapsed: ${totalTime}s`)
    console.log('')

    // Get database statistics
    const stats = await prisma.puzzle.aggregate({
      _count: true,
      _avg: { rating: true, popularity: true, moveCount: true },
      _min: { rating: true },
      _max: { rating: true }
    })

    console.log('Database statistics:')
    console.log(`  Total puzzles: ${stats._count}`)
    console.log(`  Avg rating: ${stats._avg.rating?.toFixed(0)}`)
    console.log(`  Avg popularity: ${stats._avg.popularity?.toFixed(1)}`)
    console.log(`  Avg move count: ${stats._avg.moveCount?.toFixed(1)}`)
    console.log(`  Rating range: ${stats._min.rating} - ${stats._max.rating}`)

  } catch (error) {
    console.error('Error during import:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importPuzzles()
  .then(() => {
    console.log('\nImport script finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nImport script failed:', error)
    process.exit(1)
  })
