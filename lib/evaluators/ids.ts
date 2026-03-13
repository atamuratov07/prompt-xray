export const evaluatorIds = [
  'privacy',
  'academic-integrity',
  'prompt-quality',
] as const

export type EvaluatorId = (typeof evaluatorIds)[number]
