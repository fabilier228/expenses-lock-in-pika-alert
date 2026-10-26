'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pika-alert-theme'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const enabled = localStorage.getItem(STORAGE_KEY) === 'dark'
    document.documentElement.classList.toggle('dark', enabled)
    setDark(enabled)
  }, [])

  function toggleTheme() {
    const enabled = !dark
    document.documentElement.classList.toggle('dark', enabled)
    localStorage.setItem(STORAGE_KEY, enabled ? 'dark' : 'light')
    setDark(enabled)
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-900">Dark mode</p>
        <p className="text-sm text-gray-500">Use a darker app appearance</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        onClick={toggleTheme}
        className={`relative h-7 w-12 rounded-full transition-colors ${dark ? 'bg-indigo-500' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}
