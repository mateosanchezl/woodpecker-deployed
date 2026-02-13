export const TRAINING_THEME_KEYS = [
  'mate',
  'mateIn1',
  'mateIn2',
  'mateIn3',
  'fork',
  'pin',
  'skewer',
  'discoveredAttack',
  'doubleCheck',
  'backRankMate',
  'attraction',
  'deflection',
  'sacrifice',
  'hangingPiece',
  'trappedPiece',
] as const

export type TrainingTheme = (typeof TRAINING_THEME_KEYS)[number]

export const TRAINING_THEME_OPTIONS: ReadonlyArray<{
  value: TrainingTheme
  label: string
  description: string
}> = [
  { value: 'mate', label: 'Mates', description: 'General mating patterns' },
  { value: 'mateIn1', label: 'Mate in 1', description: 'Immediate checkmates' },
  { value: 'mateIn2', label: 'Mate in 2', description: 'Two-move mating combinations' },
  { value: 'mateIn3', label: 'Mate in 3', description: 'Three-move mating combinations' },
  { value: 'fork', label: 'Forks', description: 'Attacking multiple targets at once' },
  { value: 'pin', label: 'Pins', description: 'Immobilize pieces with line pressure' },
  { value: 'skewer', label: 'Skewers', description: 'Attack through a more valuable piece' },
  { value: 'discoveredAttack', label: 'Discovered Attacks', description: 'Reveal hidden attacks by moving a piece' },
  { value: 'doubleCheck', label: 'Double Checks', description: 'Force king moves with two simultaneous checks' },
  { value: 'backRankMate', label: 'Back Rank Mate', description: 'Punish weak back rank defenses' },
  { value: 'attraction', label: 'Attraction', description: 'Lure pieces to vulnerable squares' },
  { value: 'deflection', label: 'Deflection', description: 'Distract defenders from key squares' },
  { value: 'sacrifice', label: 'Sacrifices', description: 'Give material for tactical gain' },
  { value: 'hangingPiece', label: 'Hanging Pieces', description: 'Punish undefended pieces' },
  { value: 'trappedPiece', label: 'Trapped Pieces', description: 'Win pieces with restricted mobility' },
]

const TRAINING_THEME_LABELS = new Map(
  TRAINING_THEME_OPTIONS.map((theme) => [theme.value, theme.label] as const)
)

export function getTrainingThemeLabel(theme: string | null | undefined): string {
  if (!theme) {
    return 'Any theme'
  }

  return TRAINING_THEME_LABELS.get(theme as TrainingTheme) ?? theme
}
