import {getRequestConfig} from 'next-intl/server'
import {defaultLocale, locales} from './locales'

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale
  const locale = locales.includes(requestedLocale as (typeof locales)[number])
    ? (requestedLocale as (typeof locales)[number])
    : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
