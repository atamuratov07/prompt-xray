import { evaluatorIds } from '@/lib/evaluators/ids'
import z from 'zod'

export const AnalyzeRequestSchema = z.object({
	evaluatorId: z.enum(evaluatorIds),
	prompt: z.string().trim().min(1).max(5000),
})

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>
