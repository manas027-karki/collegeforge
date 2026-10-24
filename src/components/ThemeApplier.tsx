import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeApplier() {
  const theme = useAppStore((state) => state.theme)
  const density = useAppStore((state) => state.density)
  const reduceAnimations = useAppStore((state) => state.reduceAnimations)

  useEffect(() => {
    const root = document.documentElement
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

    root.dataset.theme = resolvedTheme
    root.dataset.density = density
    root.dataset.reduceAnimations = String(reduceAnimations)
  }, [theme, density, reduceAnimations])

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = document.documentElement
      root.dataset.theme = getSystemTheme()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return null
}
