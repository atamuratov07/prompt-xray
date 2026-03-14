'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type AppLocale } from '@/i18n/locales'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

export function LocaleSwitcher() {
	const t = useTranslations('LocaleSwitcher')
	const locale = useLocale() as AppLocale
	const pathname = usePathname()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const handleLocaleChange = (nextLocale: string) => {
		if (nextLocale === locale) {
			return
		}

		startTransition(() => {
			router.replace(pathname, { locale: nextLocale as AppLocale })
		})
	}

	return (
		<Select
			value={locale}
			onValueChange={handleLocaleChange}
			disabled={isPending}
		>
			<SelectTrigger
				size='sm'
				className='w-auto justify-center gap-0 rounded-lg border-border bg-card px-2.5 text-xs font-medium uppercase [&_svg]:hidden'
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align='center' className='min-w-4'>
				{locales.map(nextLocale => (
					<SelectItem
						key={nextLocale}
						value={nextLocale}
						className='w-full pr-0 text-center text-xs font-medium uppercase data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&>span:first-child]:hidden [&>span:last-child]:w-full [&>span:last-child]:justify-center'
					>
						{t(nextLocale)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
