import { getEvaluator } from '@/lib/evaluators/registry'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import type { AppLocale } from '@/i18n/locales'
import type {
	BaseEvaluatorResponse,
	Evaluator,
} from '@/lib/evaluators/types'
import type { AnalysisResult } from '@/lib/types/common'
import { generateText, Output } from 'ai'
import { AnalyzeRequestSchema } from './schema'

const localeInstructions: Record<AppLocale, string> = {
	en: 'Override any default language preference. Return all user-facing prose in English. Keep evidence spans verbatim from the original prompt.',
	ru: 'Override any default language preference. Return all user-facing prose in Russian. Keep evidence spans verbatim from the original prompt.',
	'uz-Latn':
		'Override any default language preference. Return all user-facing prose in Uzbek written in the Latin alphabet. Do not use Cyrillic. Keep evidence spans verbatim from the original prompt.',
}

async function analyzeWithEvaluator<
	TResponse extends BaseEvaluatorResponse,
	TId extends EvaluatorId,
>({
	evaluator,
	evaluatorId,
	locale,
	prompt,
}: {
	evaluator: Evaluator<TResponse, TId>
	evaluatorId: TId
	locale: AppLocale
	prompt: string
}): Promise<AnalysisResult> {
	const { output } = await generateText({
		model: 'openai/gpt-4o-mini',
		output: Output.object({
			schema: evaluator.responseSchema,
		}),
		system: `${evaluator.systemPrompt}\n\n${localeInstructions[locale]}`,
		prompt: `Analyze this prompt:\n\n${prompt}`,
	})

	if (!output) {
		throw new Error('Failed to generate analysis')
	}

	const { score, label } = evaluator.calculateScore(output, locale)
	const suggestions = evaluator.getSuggestions(output, locale)

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

		const { evaluatorId, locale, prompt } = body.data

		switch (evaluatorId) {
			case 'privacy':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('privacy'),
						evaluatorId,
						locale,
						prompt,
					}),
				)
			case 'academic-integrity':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('academic-integrity'),
						evaluatorId,
						locale,
						prompt,
					}),
				)
			case 'prompt-quality':
				return Response.json(
					await analyzeWithEvaluator({
						evaluator: getEvaluator('prompt-quality'),
						evaluatorId,
						locale,
						prompt,
					}),
				)
		}
	} catch (error) {
		console.error('Analysis error:', error)
		return Response.json({ error: 'Analysis failed' }, { status: 500 })
	}
}
