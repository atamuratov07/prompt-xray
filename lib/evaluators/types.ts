import type {
	EvaluatorMeta,
	ExplanationCard,
	Issue,
	Rewrite,
	Severity,
} from '@/lib/types/common'
import { z } from 'zod'
import type { EvaluatorId } from './ids'
import type {
	PrivacyIssueCode,
} from './privacy'
import type {
	AcademicIssueCode,
	AcademicPositiveSignalCode,
} from './academic-integrity'
import type {
	QualityElementKey,
	QualityIssueCode,
} from './prompt-quality'

export interface BaseEvaluatorResponse<TIssue extends Issue = Issue> {
	summary: string
	issues: TIssue[]
	rewrite: Rewrite
	suggestions: string[]
}

export interface Evaluator<
	TResponse extends BaseEvaluatorResponse = BaseEvaluatorResponse,
	TId extends EvaluatorId = EvaluatorId,
> {
	meta: EvaluatorMeta & { id: TId }
	systemPrompt: string
	responseSchema: z.ZodSchema<TResponse>
	calculateScore: (response: TResponse) => { score: number; label: string }
	explanations: Record<string, ExplanationCard>
	getSuggestions: (response: TResponse) => string[]
}

// Privacy Evaluator Types
export interface PrivacyDetectedItem {
	type: string
	value: string
	severity: Severity
	necessity: 'necessary' | 'unnecessary' | 'unclear'
}

export interface PrivacyIssue {
	code: PrivacyIssueCode
	severity: Severity
	evidence: string[]
	necessity: 'necessary' | 'unnecessary' | 'unclear'
}

export interface PrivacyResponse extends BaseEvaluatorResponse<PrivacyIssue> {
	detectedItems: PrivacyDetectedItem[]
}

// Academic Integrity Evaluator Types
export interface AcademicIssue {
	code: AcademicIssueCode
	severity: Severity
	evidence: string[]
}

export interface AcademicResponse
	extends BaseEvaluatorResponse<AcademicIssue> {
	positiveSignals: AcademicPositiveSignalCode[]
}

// Prompt Quality Evaluator Types
export interface QualityIssue {
	code: QualityIssueCode
	severity: Severity
	evidence: string[]
}

export interface QualityResponse extends BaseEvaluatorResponse<QualityIssue> {
	presentElements: QualityElementKey[]
	missingElements: QualityElementKey[]
}

export type EvaluatorResponse =
	| PrivacyResponse
	| AcademicResponse
	| QualityResponse
