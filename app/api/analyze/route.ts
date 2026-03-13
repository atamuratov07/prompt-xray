import { getEvaluator } from '@/lib/evaluators/registry'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import type {
	BaseEvaluatorResponse,
	Evaluator,
} from '@/lib/evaluators/types'
import type { AnalysisResult } from '@/lib/types/common'
import { generateText, Output } from 'ai'
import { AnalyzeRequestSchema } from './schema'

async function analyzeWithEvaluator<
	TResponse extends BaseEvaluatorResponse,
	TId extends EvaluatorId,
>({
	evaluator,
	evaluatorId,
	prompt,
}: {
	evaluator: Evaluator<TResponse, TId>
	evaluatorId: TId
	prompt: string
}): Promise<AnalysisResult> {
	const { output } = await generateText({
		model: 'openai/gpt-4o-mini',
		output: Output.object({
			schema: evaluator.responseSchema,
		}),
		system: evaluator.systemPrompt,
		prompt: `Analyze this prompt:\n\n${prompt}`,
	})

	if (!output) {
		throw new Error('Failed to generate analysis')
	}

	const { score, label } = evaluator.calculateScore(output)
	const suggestions = evaluator.getSuggestions(output)

	return {
		evaluatorId,
		originalPrompt: prompt,
		summary: output.summary,
		issues: output.issues,
		score,
		scoreLabel: label,
		rewrite: output.rewrite,
		suggestions,
		timestamp: Date.now(),
	}
}

export async function POST(req: Request) {
	try {
		const body = AnalyzeRequestSchema.safeParse(await req.json())

		if (!body.success) {
			return Response.json(
				{ error: 'Invalid request', details: body.error.flatten() },
				{ status: 400 },
			)
		}

		const { evaluatorId, prompt } = body.data

		switch (evaluatorId) {
			case 'privacy':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('privacy'),
						evaluatorId,
						prompt,
					}),
				)
			case 'academic-integrity':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('academic-integrity'),
						evaluatorId,
						prompt,
					}),
				)
			case 'prompt-quality':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('prompt-quality'),
						evaluatorId,
						prompt,
					}),
				)
		}
	} catch (error) {
		console.error('Analysis error:', error)
		return Response.json({ error: 'Analysis failed' }, { status: 500 })
	}
}
