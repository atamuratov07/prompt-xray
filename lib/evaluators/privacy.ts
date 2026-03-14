import type { AppLocale } from '@/i18n/locales'
import type { ExplanationCard } from '@/lib/types/common'
import { NECESSITY_MODIFIER, SEVERITY_MULTIPLIER } from '@/lib/types/common'
import { z } from 'zod'
import {
	type LocalizedSuggestionMap,
	type LocalizedText,
	resolveFallbackSuggestions,
} from './suggestion-utils'
import { type Evaluator, type PrivacyResponse } from './types'

export const privacyIssueCodes = [
	'personal_name_exposed',
	'organization_exposed',
	'location_exposed',
	'email_exposed',
	'phone_exposed',
	'id_number_exposed',
	'username_exposed',
	'other_sensitive_exposed',
] as const

export type PrivacyIssueCode = (typeof privacyIssueCodes)[number]

const privacyIssueCodeSchema = z.enum(privacyIssueCodes)

const privacyResponseSchema = z.object({
	summary: z.string(),
	issues: z.array(
		z.object({
			code: privacyIssueCodeSchema,
			severity: z.enum(['low', 'medium', 'high']),
			evidence: z.array(z.string()),
			necessity: z.enum(['necessary', 'unnecessary', 'unclear']),
		}),
	),
	detectedItems: z.array(
		z.object({
			type: z.string(),
			value: z.string(),
			severity: z.enum(['low', 'medium', 'high']),
			necessity: z.enum(['necessary', 'unnecessary', 'unclear']),
		}),
	),
	rewrite: z.object({
		type: z.string(),
		text: z.string(),
	}),
	suggestions: z.array(z.string()),
})

const BASE_WEIGHTS: Record<PrivacyIssueCode, number> = {
	personal_name_exposed: 20,
	organization_exposed: 15,
	location_exposed: 20,
	email_exposed: 20,
	phone_exposed: 25,
	id_number_exposed: 30,
	username_exposed: 15,
	other_sensitive_exposed: 15,
}

const privacyScoreLabels: Record<
	AppLocale,
	{
		noRisk: string
		low: string
		moderate: string
		high: string
		critical: string
	}
> = {
	en: {
		noRisk: 'No Privacy Risk',
		low: 'Low Risk',
		moderate: 'Moderate Risk',
		high: 'High Risk',
		critical: 'Critical Risk',
	},
	ru: {
		noRisk: 'Нет риска приватности',
		low: 'Низкий риск',
		moderate: 'Умеренный риск',
		high: 'Высокий риск',
		critical: 'Критический риск',
	},
	uz: {
		noRisk: 'Maxfiylik xavfi yo\'q',
		low: 'Past xavf',
		moderate: 'O\'rta xavf',
		high: 'Yuqori xavf',
		critical: 'Juda yuqori xavf',
	},
}

const privacyFallbackSuggestions = {
	personal_name_exposed: [
		{
			en: 'Remove or anonymize personal names.',
			ru: 'Удалите или анонимизируйте личные имена.',
			uz: 'Shaxsiy ismlarni olib tashlang yoki anonimlashtiring.',
		},
	],
	organization_exposed: [
		{
			en: 'Replace organization names with neutral placeholders.',
			ru: 'Замените названия организаций нейтральными плейсхолдерами.',
			uz: 'Tashkilot nomlarini neytral o\'rinbosarlar bilan almashtiring.',
		},
	],
	location_exposed: [
		{
			en: 'Use general location descriptions instead of specific places.',
			ru: 'Используйте общие описания мест вместо конкретных локаций.',
			uz:
				'Aniq joy nomlari o\'rniga umumiy joylashuv tavsiflaridan foydalaning.',
		},
	],
	email_exposed: [
		{
			en: 'Never include real contact information in prompts.',
			ru: 'Никогда не указывайте реальные контактные данные в промптах.',
			uz:
				'Promptlarda hech qachon haqiqiy aloqa ma\'lumotlarini kiritmang.',
		},
	],
	phone_exposed: [
		{
			en: 'Never include real contact information in prompts.',
			ru: 'Никогда не указывайте реальные контактные данные в промптах.',
			uz:
				'Promptlarda hech qachon haqiqiy aloqa ma\'lumotlarini kiritmang.',
		},
	],
	id_number_exposed: [
		{
			en: 'Remove all official ID numbers immediately.',
			ru: 'Немедленно удалите все официальные идентификационные номера.',
			uz: 'Barcha rasmiy ID raqamlarini darhol olib tashlang.',
		},
	],
	username_exposed: [
		{
			en: 'Replace usernames with neutral placeholders or remove them.',
			ru: 'Замените имена пользователей нейтральными плейсхолдерами или удалите их.',
			uz:
				'Foydalanuvchi nomlarini neytral o\'rinbosarlar bilan almashtiring yoki olib tashlang.',
		},
	],
	other_sensitive_exposed: [
		{
			en: 'Replace sensitive specifics with neutral placeholders.',
			ru: 'Замените чувствительные детали нейтральными плейсхолдерами.',
			uz:
				'Nozik aniq ma\'lumotlarni neytral o\'rinbosarlar bilan almashtiring.',
		},
	],
} satisfies LocalizedSuggestionMap<PrivacyIssueCode>

const privacyFallbackNoIssues = {
	en: 'Your prompt appears privacy-safe!',
	ru: 'Ваш промпт выглядит безопасным с точки зрения приватности.',
	uz: 'Promptingiz maxfiylik nuqtai nazaridan xavfsiz ko\'rinadi!',
} satisfies LocalizedText

function calculateScore(response: PrivacyResponse, locale: AppLocale): {
	score: number
	label: string
} {
	let totalRisk = 0

	for (const issue of response.issues) {
		const baseWeight = BASE_WEIGHTS[issue.code] || 15
		const severityMult = SEVERITY_MULTIPLIER[issue.severity]
		const necessityMod = NECESSITY_MODIFIER[issue.necessity]
		totalRisk += baseWeight * severityMult * necessityMod
	}

	const score = Math.min(Math.round(totalRisk), 100)
	const labels = privacyScoreLabels[locale]

	let label: string
	if (score === 0) {
		label = labels.noRisk
	} else if (score <= 25) {
		label = labels.low
	} else if (score <= 50) {
		label = labels.moderate
	} else if (score <= 75) {
		label = labels.high
	} else {
		label = labels.critical
	}

	return { score, label }
}

const explanations: Record<PrivacyIssueCode, ExplanationCard> = {
	personal_name_exposed: {
		title: 'Personal name exposed',
		description:
			'Your prompt contains a personal name that could identify you or someone else.',
		whyItMatters:
			'Personal names combined with other context can be used to identify individuals, especially in AI systems that may log or process data.',
		howToFix:
			'Replace the name with a placeholder like "[Name]" or remove it if not essential to your request.',
	},
	organization_exposed: {
		title: 'Organization name exposed',
		description:
			'Your prompt contains the name of a school, company, or organization.',
		whyItMatters:
			'Organization names can narrow down your identity and may reveal sensitive affiliations.',
		howToFix:
			'Replace with "[Organization]" or describe the type of institution without naming it.',
	},
	location_exposed: {
		title: 'Location details exposed',
		description: 'Your prompt contains specific location information.',
		whyItMatters:
			'Precise locations can be used to identify or track individuals.',
		howToFix:
			'Use general descriptions like "a city" or "[Location]" instead of specific addresses or place names.',
	},
	email_exposed: {
		title: 'Email address exposed',
		description: 'Your prompt contains an email address.',
		whyItMatters:
			'Email addresses are unique identifiers that can be used for tracking, spam, or phishing.',
		howToFix:
			'Replace with "[email]" or describe the type of email format needed.',
	},
	phone_exposed: {
		title: 'Phone number exposed',
		description: 'Your prompt contains a phone number.',
		whyItMatters:
			'Phone numbers are highly personal and can be used for unwanted contact or identity verification.',
		howToFix: 'Replace with "[phone number]" or use a placeholder format.',
	},
	id_number_exposed: {
		title: 'ID or official number exposed',
		description: 'Your prompt contains an official identification number.',
		whyItMatters:
			'ID numbers are sensitive credentials that could be used for identity theft.',
		howToFix:
			'Never include real ID numbers. Use "[ID number]" or describe the format needed.',
	},
	username_exposed: {
		title: 'Username or handle exposed',
		description: 'Your prompt contains a social media handle or username.',
		whyItMatters:
			'Usernames can link to real identities and online profiles.',
		howToFix: 'Replace with "@[username]" or remove if not essential.',
	},
	other_sensitive_exposed: {
		title: 'Other sensitive information exposed',
		description:
			'Your prompt contains other potentially identifying information.',
		whyItMatters:
			'Various details can be combined to create a profile or identify individuals.',
		howToFix:
			'Review what information is truly necessary and replace specifics with placeholders.',
	},
}

export const privacyEvaluator: Evaluator<PrivacyResponse, 'privacy'> = {
	meta: {
		id: 'privacy',
		name: 'Privacy Check',
		description:
			'Detect personal or identifying information that may be unnecessarily exposed.',
		purpose:
			'Protect your privacy by finding and sanitizing sensitive data in your prompts.',
		icon: 'Shield',
	},
	systemPrompt: `You are a privacy evaluator for user-written prompts.

Your task is to analyze the user's prompt only for privacy and unnecessary exposure of personal or identifying information.

Do not evaluate morality, academic honesty, or prompt quality unless they directly affect privacy.

Return a strict JSON object.

Detect:
- personal names
- school / company / organization names
- location details
- phone numbers
- email addresses
- usernames / handles
- IDs or long identifying numbers
- other sensitive personal details

For each detected item:
- classify the type
- assign necessity: necessary / unnecessary / unclear
- assign severity: low / medium / high
- provide exact evidence span from the prompt

Also provide:
- a short summary
- a sanitized rewrite that removes unnecessary identifying information while preserving the user's intent
- a list of issues using these fixed issue codes only: personal_name_exposed, organization_exposed, location_exposed, email_exposed, phone_exposed, id_number_exposed, username_exposed, other_sensitive_exposed
- suggestions for how to fix the privacy issues

Respond in the same language as the user's prompt when possible.`,
	responseSchema: privacyResponseSchema,
	calculateScore,
	explanations,
	getSuggestions: (response: PrivacyResponse, locale: AppLocale) => {
		if (response.suggestions.length > 0) {
			return response.suggestions
		}

		return resolveFallbackSuggestions({
			codes: response.issues.map(issue => issue.code),
			locale,
			suggestionsByCode: privacyFallbackSuggestions,
			fallback: privacyFallbackNoIssues,
		})
	},
}
