import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import {notFound} from 'next/navigation'
import type {ReactNode} from 'react'
import {locales, type AppLocale} from '@/i18n/locales'

export function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params

  if (!locales.includes(locale as AppLocale)) {
    notFound()
  }

  const validLocale = locale as AppLocale
  setRequestLocale(validLocale)

  return (
    <NextIntlClientProvider locale={validLocale}>
      {children}
    </NextIntlClientProvider>
  )
}
