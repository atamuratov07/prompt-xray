// Common types for the Prompt X-Ray application

import type { EvaluatorId } from '@/lib/evaluators/ids'

export type Severity = 'low' | 'medium' | 'high'
export type Necessity = 'necessary' | 'unnecessary' | 'unclear'

export interface Issue {
	code: string
	severity: Severity
	evidence: string[]
}

export interface Rewrite {
	type: string
	text: string
}

export interface ExplanationCard {
	title: string
	description: string
	whyItMatters: string
	howToFix: string
}

export interface EvaluatorMeta {
	id: EvaluatorId
	name: string
	description: string
	purpose: string
	icon: string
}

export interface AnalysisResult {
	evaluatorId: EvaluatorId
	originalPrompt: string
	summary: string
	issues: Issue[]
	score: number
	scoreLabel: string
	rewrite: Rewrite
	suggestions: string[]
	timestamp: number
}

export interface HistoryEntry {
	id: string
	evaluatorId: EvaluatorId
	originalPrompt: string
	score: number
	scoreLabel: string
	summary: string
	rewrittenPrompt: string
	timestamp: number
}

// Severity multipliers for scoring
export const SEVERITY_MULTIPLIER: Record<Severity, number> = {
	low: 0.5,
	medium: 0.75,
	high: 1.0,
}

// Necessity modifiers for privacy scoring
export const NECESSITY_MODIFIER: Record<Necessity, number> = {
	necessary: 0.4,
	unclear: 0.8,
	unnecessary: 1.0,
}
