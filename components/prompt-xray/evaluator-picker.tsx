'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import type { EvaluatorMeta } from '@/lib/types/common'
import { cn } from '@/lib/utils'
import { Check, GraduationCap, Shield, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

const iconMap: Record<string, React.ElementType> = {
	Shield,
	GraduationCap,
	Sparkles,
}

interface EvaluatorPickerProps {
	evaluators: EvaluatorMeta[]
	selected: EvaluatorId
	onSelect: (id: EvaluatorId) => void
	disabled?: boolean
}

export function EvaluatorPicker({
	evaluators,
	selected,
	onSelect,
	disabled,
}: EvaluatorPickerProps) {
	const t = useTranslations('EvaluatorPicker')
	const evaluatorT = useTranslations('Evaluators')
	return (
		<div className='flex flex-col gap-3'>
			<label className='text-sm font-medium text-muted-foreground'>
				{t('label')}
			</label>
			<ScrollArea className='w-full whitespace-nowrap [&_[data-slot=scroll-area-viewport]]:snap-x [&_[data-slot=scroll-area-viewport]]:snap-mandatory [&_[data-slot=scroll-area-viewport]]:scroll-smooth [&_[data-slot=scroll-area-viewport]]:overscroll-x-contain [&_[data-slot=scroll-area-viewport]]:rounded-none'>
				<div className='flex w-max gap-3 pb-2'>
					{evaluators.map(evaluator => {
						const Icon = iconMap[evaluator.icon] || Sparkles
						const isSelected = selected === evaluator.id

						return (
							<button
								key={evaluator.id}
								onClick={() => onSelect(evaluator.id)}
								disabled={disabled}
								className={cn(
									'group relative flex min-h-36 w-70 shrink-0 snap-start flex-col gap-2 rounded-lg border p-4 text-left transition-all',
									'hover:border-primary/50 hover:bg-secondary/50',
									'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
									'disabled:cursor-not-allowed disabled:opacity-50',
									isSelected
										? 'border-primary bg-primary/10'
										: 'border-border bg-card',
								)}
							>
								<div className='flex items-center gap-3'>
									<div
										className={cn(
											'flex h-10 w-10 items-center justify-center rounded-md',
											isSelected
												? 'bg-primary text-primary-foreground'
												: 'bg-secondary text-muted-foreground group-hover:text-foreground',
										)}
									>
										<Icon className='h-5 w-5' />
									</div>
									<span className='font-semibold text-foreground whitespace-normal'>
										{evaluatorT(`${evaluator.id}.name`)}
									</span>
								</div>
								<p className='text-sm leading-relaxed text-muted-foreground whitespace-normal'>
									{evaluatorT(`${evaluator.id}.description`)}
								</p>
								{isSelected && (
									<div className='absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
										<Check className='h-3 w-3' />
									</div>
								)}
							</button>
						)
					})}
				</div>
				<ScrollBar orientation='horizontal' className='h-1 p-0' />
			</ScrollArea>
		</div>
	)
}
