'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
	const [mounted, setMounted] = useState(false)
	const { resolvedTheme, setTheme } = useTheme()

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	const isDark = resolvedTheme === 'dark'

	return (
		<SwitchPrimitive.Root
			data-slot='theme-switch'
			checked={isDark}
			onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
			aria-label={`Activate ${isDark ? 'light' : 'dark'} theme`}
			className='inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-muted/80 p-1 shadow-xs backdrop-blur-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:bg-primary/20 data-[state=unchecked]:bg-muted/80'
		>
			<SwitchPrimitive.Thumb
				data-slot='theme-switch-thumb'
				className='flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:bg-card dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground'
			>
				{isDark ? (
					<MoonIcon aria-hidden='true' className='size-4' />
				) : (
					<SunIcon aria-hidden='true' className='size-4' />
				)}
			</SwitchPrimitive.Thumb>
		</SwitchPrimitive.Root>
	)
}
