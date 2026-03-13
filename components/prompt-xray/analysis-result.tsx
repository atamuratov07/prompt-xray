'use client'

import { ScoreCard } from './score-card'
import { IssueCard } from './issue-card'
import { SuggestionsList } from './suggestions-list'
import { RewritePanel } from './rewrite-panel'
import type { AnalysisResult as AnalysisResultType } from '@/lib/types/common'
import { getEvaluatorMeta } from '@/lib/evaluators/registry'
import { useTranslations } from 'next-intl'

interface AnalysisResultProps {
	result: AnalysisResultType
}

export function AnalysisResult({ result }: AnalysisResultProps) {
	const t = useTranslations('AnalysisResult')
	const evaluatorT = useTranslations('Evaluators')
	const meta = getEvaluatorMeta(result.evaluatorId)

	const isRiskScore = result.evaluatorId !== 'prompt-quality'

	return (
		<div className='space-y-8'>
			{/* Score Card */}
			<ScoreCard
				evaluatorName={
					meta ? evaluatorT(`${meta.id}.name`) : result.evaluatorId
				}
				score={result.score}
				label={result.scoreLabel}
				isRiskScore={isRiskScore}
			/>

			{/* Summary */}
			<div className='space-y-2'>
				<h3 className='font-semibold text-foreground'>{t('summary')}</h3>
				<p className='text-muted-foreground leading-relaxed'>
					{result.summary}
				</p>
			</div>

			{/* Issues */}
			{result.issues.length > 0 && (
				<div className='space-y-4'>
					<h3 className='font-semibold text-foreground'>
						{t('findings', {count: result.issues.length})}
					</h3>
					<div className='space-y-4'>
						{result.issues.map((issue, i) => (
							<IssueCard
								key={i}
								evaluatorId={result.evaluatorId}
								code={issue.code}
								severity={issue.severity}
								evidence={issue.evidence}
							/>
						))}
					</div>
				</div>
			)}

			{/* Suggestions */}
			<SuggestionsList suggestions={result.suggestions} />

			{/* Rewrite Panel */}
			<RewritePanel
				original={result.originalPrompt}
				rewritten={result.rewrite.text}
				rewriteType={result.rewrite.type}
			/>
		</div>
	)
}
