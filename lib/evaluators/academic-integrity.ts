import type { AppLocale } from '@/i18n/locales'
import type { ExplanationCard } from '@/lib/types/common'
import { SEVERITY_MULTIPLIER } from '@/lib/types/common'
import { z } from 'zod'
import {
	type LocalizedSuggestionMap,
	type LocalizedText,
	resolveFallbackSuggestions,
} from './suggestion-utils'
import type { Evaluator, AcademicResponse } from './types'

export const academicIssueCodes = [
	'full_task_outsourcing',
	'concealment_intent',
	'answer_only_request',
	'minor_over_reliance',
] as const

export type AcademicIssueCode = (typeof academicIssueCodes)[number]

export const academicPositiveSignalCodes = [
	'asks_for_explanation',
	'asks_for_quiz',
	'asks_for_outline',
	'asks_for_feedback',
] as const

export type AcademicPositiveSignalCode =
	(typeof academicPositiveSignalCodes)[number]

const academicIssueCodeSchema = z.enum(academicIssueCodes)
const academicPositiveSignalCodeSchema = z.enum(academicPositiveSignalCodes)

const academicResponseSchema = z.object({
	summary: z.string(),
	issues: z.array(
		z.object({
			code: academicIssueCodeSchema,
			severity: z.enum(['low', 'medium', 'high']),
			evidence: z.array(z.string()),
		}),
	),
	positiveSignals: z.array(academicPositiveSignalCodeSchema),
	rewrite: z.object({
		type: z.string(),
		text: z.string(),
	}),
	suggestions: z.array(z.string()),
})

const ISSUE_WEIGHTS: Record<AcademicIssueCode, number> = {
	full_task_outsourcing: 45,
	concealment_intent: 35,
	answer_only_request: 20,
	minor_over_reliance: 10,
}

const POSITIVE_BONUSES: Record<AcademicPositiveSignalCode, number> = {
	asks_for_explanation: 15,
	asks_for_quiz: 10,
	asks_for_outline: 10,
	asks_for_feedback: 10,
}

const academicScoreLabels: Record<
	AppLocale,
	{
		none: string
		minor: string
		moderate: string
		high: string
		critical: string
	}
> = {
	en: {
		none: 'No Integrity Concerns',
		minor: 'Minor Concerns',
		moderate: 'Moderate Risk',
		high: 'High Risk',
		critical: 'Critical Risk',
	},
	ru: {
		none: 'Нарушений не выявлено',
		minor: 'Незначительные риски',
		moderate: 'Умеренный риск',
		high: 'Высокий риск',
		critical: 'Критический риск',
	},
	uz: {
		none: 'Halollik bo\'yicha muammo yo\'q',
		minor: 'Yengil xavotirlar',
		moderate: 'O\'rta xavf',
		high: 'Yuqori xavf',
		critical: 'Juda yuqori xavf',
	},
}

const academicFallbackSuggestions = {
	full_task_outsourcing: [
		{
			en: 'Ask for an outline instead of a full submission.',
			ru: 'Попросите план вместо готовой работы.',
			uz: 'Tayyor topshiriq o\'rniga reja yoki outline so\'rang.',
		},
		{
			en: 'Request explanations of key concepts to understand better.',
			ru: 'Запросите объяснение ключевых понятий, чтобы лучше понять материал.',
			uz:
				'Materialni yaxshiroq tushunish uchun asosiy tushunchalar izohini so\'rang.',
		},
	],
	concealment_intent: [
		{
			en: 'Be transparent about AI assistance when required.',
			ru: 'Будьте прозрачны в вопросе использования ИИ, если это требуется.',
			uz: 'Talab qilinsa, AI yordami haqida ochiq va shaffof bo\'ling.',
		},
		{
			en: 'Use AI as a learning tool, not a ghostwriter.',
			ru: 'Используйте ИИ как инструмент обучения, а не как гострайтера.',
			uz:
				'AIdan ghostwriter sifatida emas, o\'rganish vositasi sifatida foydalaning.',
		},
	],
	answer_only_request: [
		{
			en: 'Ask for step-by-step explanations.',
			ru: 'Попросите пошаговые объяснения.',
			uz: 'Bosqichma-bosqich tushuntirishlarni so\'rang.',
		},
		{
			en: 'Request practice problems to test your understanding.',
			ru: 'Попросите практические задания, чтобы проверить понимание.',
			uz:
				'Tushunganingizni tekshirish uchun amaliy mashqlar yoki savollar so\'rang.',
		},
	],
	minor_over_reliance: [
		{
			en: 'Try the task yourself before asking AI to complete it.',
			ru: 'Сначала попробуйте выполнить задачу самостоятельно, прежде чем передавать её ИИ.',
			uz:
				'Vazifani avval o\'zingiz bajarib ko\'ring, keyin kerak bo\'lsa AIga murojaat qiling.',
		},
		{
			en: 'Ask AI to review or explain your approach instead of replacing it.',
			ru: 'Попросите ИИ проверить или объяснить ваш подход вместо того, чтобы заменять его.',
			uz:
				'AIdan yondashuvingizni almashtirish o\'rniga uni tekshirib berish yoki tushuntirishni so\'rang.',
		},
	],
} satisfies LocalizedSuggestionMap<AcademicIssueCode>

const academicFallbackNoIssues = {
	en: 'Your prompt shows good learning intent!',
	ru: 'Ваш промпт показывает хорошую учебную мотивацию.',
	uz: 'Promptingiz yaxshi o\'quv niyatini ko\'rsatadi!',
} satisfies LocalizedText

function calculateScore(
	response: AcademicResponse,
	locale: AppLocale,
): { score: number; label: string } {
	let totalRisk = 0

	for (const issue of response.issues) {
		const baseWeight = ISSUE_WEIGHTS[issue.code] || 15
		const severityMult = SEVERITY_MULTIPLIER[issue.severity]
		totalRisk += baseWeight * severityMult
	}

	let totalBonus = 0
	for (const signal of response.positiveSignals) {
		totalBonus += POSITIVE_BONUSES[signal] || 5
	}

	const score = Math.max(0, Math.min(100, Math.round(totalRisk - totalBonus)))
	const labels = academicScoreLabels[locale]

	let label: string
	if (score === 0) {
		label = labels.none
	} else if (score <= 25) {
		label = labels.minor
	} else if (score <= 50) {
		label = labels.moderate
	} else if (score <= 75) {
		label = labels.high
	} else {
		label = labels.critical
	}

	return { score, label }
}

const explanations: Record<AcademicIssueCode, ExplanationCard> = {
	full_task_outsourcing: {
		title: 'Full task outsourcing detected',
		description:
			'Your prompt asks AI to complete an entire assignment or task for you.',
		whyItMatters:
			'Submitting AI-generated work as your own undermines learning and violates academic integrity policies at most institutions.',
		howToFix:
			'Ask for help understanding concepts, creating outlines, or reviewing your own work instead of full completion.',
	},
	concealment_intent: {
		title: 'Concealment intent detected',
		description:
			'Your prompt explicitly asks to hide AI involvement or make output appear human-written.',
		whyItMatters:
			'Attempting to conceal AI assistance is deceptive and typically violates academic honesty policies.',
		howToFix:
			'Remove concealment requests. Consider asking for guidance you can build upon transparently.',
	},
	answer_only_request: {
		title: 'Answer-only request',
		description:
			'Your prompt asks for direct answers without learning context.',
		whyItMatters:
			'Getting answers without understanding reduces your learning and may not help with future similar problems.',
		howToFix:
			'Ask for explanations alongside answers, or request step-by-step guidance.',
	},
	minor_over_reliance: {
		title: 'Minor over-reliance pattern',
		description:
			'Your prompt shows some dependency on AI for work you might benefit from doing yourself.',
		whyItMatters:
			'Over-relying on AI can prevent skill development and deep understanding.',
		howToFix:
			'Try the task yourself first, then use AI for clarification or review.',
	},
}

export const academicIntegrityEvaluator: Evaluator<
	AcademicResponse,
	'academic-integrity'
> = {
	meta: {
		id: 'academic-integrity',
		name: 'Academic Integrity Check',
		description:
			'Detect academic dishonesty patterns like outsourcing and concealment requests.',
		purpose: 'Ensure your AI usage supports learning rather than replacing it.',
		icon: 'GraduationCap',
	},
	systemPrompt: `You are an academic integrity evaluator for user-written prompts.

Analyze the user's prompt only for academic honesty, outsourcing of schoolwork, concealment of AI assistance, and learning value.

Do not evaluate privacy or general prompt quality unless directly relevant to academic integrity.

Return a strict JSON object.

Detect:
- full-task outsourcing (asking AI to complete entire assignments)
- concealment intent (asking to hide AI involvement)
- answer-only requests without learning intent
- honest help-seeking
- study-oriented requests

For each issue:
- assign severity: low / medium / high
- provide evidence spans
- use these fixed issue codes only: full_task_outsourcing, concealment_intent, answer_only_request, minor_over_reliance

For positive signals, use these codes: asks_for_explanation, asks_for_quiz, asks_for_outline, asks_for_feedback

Also provide:
- a short summary
- a learning-oriented rewrite that preserves the user's academic goal without dishonest outsourcing
- a list of actionable suggestions

Respond in the same language as the user's prompt when possible.`,
	responseSchema: academicResponseSchema,
	calculateScore,
	explanations,
	getSuggestions: (response: AcademicResponse, locale: AppLocale) => {
		if (response.suggestions.length > 0) {
			return response.suggestions
		}

		return resolveFallbackSuggestions({
			codes: response.issues.map(issue => issue.code),
			locale,
			suggestionsByCode: academicFallbackSuggestions,
			fallback: academicFallbackNoIssues,
		})
	},
}
