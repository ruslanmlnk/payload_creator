'use client'

import { useEffect, useId, useState } from 'react'

import { customThemeClass, customThemeCSS, customThemeVars } from '../theme/customTheme.js'
import styles from './ThemeSelector.module.css'

type ThemeOption = 'light' | 'dark' | 'custom'
type PayloadTheme = 'light' | 'dark'

const storageKey = 'payload-plugin-theme'
const customThemeStyleId = 'payload-plugin-custom-theme-styles'
const defaultThemeCookieKey = 'payload-theme'
const selectionToTheme: Record<ThemeOption, PayloadTheme> = {
  light: 'light',
  dark: 'dark',
  custom: 'dark',
}
const themeToSelection: Record<PayloadTheme, ThemeOption> = {
  light: 'light',
  dark: 'dark',
}
const applyCustomThemeStyles = () => {
  const existing = document.getElementById(customThemeStyleId) as HTMLStyleElement | null

  if (existing) {
    if (existing.textContent !== customThemeCSS) {
      existing.textContent = customThemeCSS
    }
    return
  }

  const style = document.createElement('style')
  style.id = customThemeStyleId
  style.textContent = customThemeCSS
  document.head.appendChild(style)
}

const removeCustomThemeStyles = () => {
  const existing = document.getElementById(customThemeStyleId)
  if (existing?.parentNode) {
    existing.parentNode.removeChild(existing)
  }
}

const primeThemeBeforeHydration = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    const root = document.documentElement

    if (stored === 'custom') {
      root.classList.add(customThemeClass)
      for (const [key, value] of Object.entries(customThemeVars)) {
        root.style.setProperty(key, value)
      }
      root.style.colorScheme = 'dark'
      root.setAttribute('data-theme', 'dark')
      applyCustomThemeStyles()
      return
    }

    if (stored === 'light' || stored === 'dark') {
      root.classList.remove(customThemeClass)
      root.setAttribute('data-theme', stored)
      root.style.colorScheme = stored
      removeCustomThemeStyles()
    }
  } catch {}
}

primeThemeBeforeHydration()

export const ThemeSelector = () => {
  const selectId = useId()
  const [selection, setSelection] = useState<ThemeOption>('light')
  const [isReady, setIsReady] = useState(false)
  const [themeCookieKey, setThemeCookieKey] = useState(defaultThemeCookieKey)

  useEffect(() => {
    const cookies = document.cookie.split('; ').filter(Boolean)
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=')
      if (name?.endsWith('-theme') && (value === 'light' || value === 'dark' || value === 'auto')) {
        setThemeCookieKey(name)
        break
      }
    }
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark' || stored === 'custom') {
      setSelection(stored)
      setIsReady(true)
      return
    }

    const root = document.documentElement
    if (root.classList.contains(customThemeClass)) {
      setSelection('custom')
      setIsReady(true)
      return
    }

    const fromDom = root.getAttribute('data-theme')
    if (fromDom === 'dark' || fromDom === 'light') {
      setSelection(themeToSelection[fromDom])
    }
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    const root = document.documentElement
    const targetTheme = selectionToTheme[selection]
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)

    if (selection === 'custom') {
      root.classList.add(customThemeClass)
      for (const [key, value] of Object.entries(customThemeVars)) {
        root.style.setProperty(key, value)
      }
      root.style.colorScheme = 'dark'
      root.setAttribute('data-theme', 'dark')
      applyCustomThemeStyles()
    } else {
      root.classList.remove(customThemeClass)
      for (const key of Object.keys(customThemeVars)) {
        root.style.removeProperty(key)
      }
      root.style.removeProperty('color-scheme')
      root.setAttribute('data-theme', targetTheme)
      removeCustomThemeStyles()
    }

    document.cookie = `${themeCookieKey}=${targetTheme}; expires=${expires.toUTCString()}; path=/`

    window.localStorage.setItem(storageKey, selection)
  }, [isReady, selection, themeCookieKey])

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={selectId}>
        Theme
      </label>
      <select
        className={styles.select}
        id={selectId}
        onChange={(event) => setSelection(event.target.value as ThemeOption)}
        value={selection}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="custom">Custom</option>
      </select>
    </div>
  )
}
