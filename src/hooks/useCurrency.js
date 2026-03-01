import { useState, useCallback } from 'react'

const currencies = [
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO', decimals: 0 },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE', decimals: 2 },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'es-ES', decimals: 2 },
]

export default function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState(() => localStorage.getItem('currency') || 'COP')

  const setCurrency = useCallback((code) => {
    localStorage.setItem('currency', code)
    setCurrencyCode(code)
  }, [])

  const formatCurrency = useCallback((amount, code) => {
    const c = currencies.find(x => x.code === (code || currencyCode)) || currencies[0]
    return new Intl.NumberFormat(c.locale, {
      style: 'currency',
      currency: c.code,
      minimumFractionDigits: c.decimals,
      maximumFractionDigits: c.decimals,
    }).format(amount)
  }, [currencyCode])

  const getCurrencySymbol = useCallback((code) => {
    return currencies.find(x => x.code === (code || currencyCode))?.symbol || '$'
  }, [currencyCode])

  return { currencyCode, setCurrency, formatCurrency, getCurrencySymbol, availableCurrencies: currencies }
}
