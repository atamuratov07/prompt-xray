import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import {
	IBM_Plex_Mono,
	Lora,
	Poppins,
} from 'next/font/google'
import { getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const fontSans = Poppins({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-sans',
})

const fontSerif = Lora({
	subsets: ['latin'],
	variable: '--font-serif',
})

const fontMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: 'Prompt X-Ray | Multi-Mode Prompt Evaluation',
	description:
		'Analyze your AI prompts for privacy issues, academic integrity, and quality before sending them.',
	icons: {
		icon: '/icon.svg',
		shortcut: '/icon.svg',
		apple: '/apple-icon.svg',
	},
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
			>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
