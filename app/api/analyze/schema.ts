import { evaluatorIds } from '@/lib/evaluators/ids'
import { locales } from '@/i18n/locales'
import z from 'zod'

export const AnalyzeRequestSchema = z.object({
	evaluatorId: z.enum(evaluatorIds),
	prompt: z.string().trim().min(1).max(5000),
	locale: z.enum(locales),
})

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>
