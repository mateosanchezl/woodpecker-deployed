import type { CSSProperties } from 'react'

export const BOARD_THEME_IDS = [
  'peck',
  'tournament',
  'slate',
  'blueprint',
] as const

export type BoardThemeId = (typeof BOARD_THEME_IDS)[number]

export interface BoardThemeDefinition {
  id: BoardThemeId
  label: string
  description: string
  lightSquareColor: string
  darkSquareColor: string
}

const BOARD_THEME_DEFINITIONS: Record<BoardThemeId, BoardThemeDefinition> = {
  peck: {
    id: 'peck',
    label: 'Peck',
    description: 'The current moss-and-cream board.',
    darkSquareColor: 'oklch(0.60 0.10 145)',
    lightSquareColor: 'oklch(0.96 0.03 145)',
  },
  tournament: {
    id: 'tournament',
    label: 'Tournament',
    description: 'Warm walnut and parchment.',
    darkSquareColor: 'oklch(0.54 0.06 70)',
    lightSquareColor: 'oklch(0.95 0.03 85)',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    description: 'Graphite squares with a stone base.',
    darkSquareColor: 'oklch(0.50 0.02 255)',
    lightSquareColor: 'oklch(0.93 0.01 255)',
  },
  blueprint: {
    id: 'blueprint',
    label: 'Blueprint',
    description: 'Navy contrast with icy light squares.',
    darkSquareColor: 'oklch(0.52 0.08 245)',
    lightSquareColor: 'oklch(0.95 0.02 230)',
  },
}

export const DEFAULT_BOARD_THEME: BoardThemeId = 'peck'

export const BOARD_THEME_OPTIONS = BOARD_THEME_IDS.map(
  (themeId) => BOARD_THEME_DEFINITIONS[themeId]
)

export function resolveBoardTheme(themeId?: string | null): BoardThemeId {
  if (!themeId) {
    return DEFAULT_BOARD_THEME
  }

  return themeId in BOARD_THEME_DEFINITIONS
    ? (themeId as BoardThemeId)
    : DEFAULT_BOARD_THEME
}

export function getBoardTheme(themeId?: string | null): BoardThemeDefinition {
  return BOARD_THEME_DEFINITIONS[resolveBoardTheme(themeId)]
}

export function getBoardThemeSquareStyles(themeId?: string | null): {
  lightSquareStyle: CSSProperties
  darkSquareStyle: CSSProperties
} {
  const theme = getBoardTheme(themeId)

  return {
    lightSquareStyle: {
      backgroundColor: theme.lightSquareColor,
    },
    darkSquareStyle: {
      backgroundColor: theme.darkSquareColor,
    },
  }
}
