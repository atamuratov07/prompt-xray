import { privacyEvaluator } from './privacy'
import { academicIntegrityEvaluator } from './academic-integrity'
import { promptQualityEvaluator } from './prompt-quality'
import type { EvaluatorId } from './ids'

export const evaluatorRegistry = {
	privacy: privacyEvaluator,
	'academic-integrity': academicIntegrityEvaluator,
	'prompt-quality': promptQualityEvaluator,
} as const

export type EvaluatorRegistry = typeof evaluatorRegistry

export const evaluatorList = [
	privacyEvaluator.meta,
	academicIntegrityEvaluator.meta,
	promptQualityEvaluator.meta,
]

export function getEvaluator<TId extends keyof EvaluatorRegistry>(id: TId) {
	return evaluatorRegistry[id]
}

export function getEvaluatorMeta(id: EvaluatorId) {
	return evaluatorList.find(e => e.id === id)
}
