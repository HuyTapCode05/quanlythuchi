import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const THEME_KEY = 'fintrack_theme'

const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
}

const getStoredTheme = () => {
    try {
        return localStorage.getItem(THEME_KEY) || 'system'
    } catch {
        return 'system'
    }
}

const getEffectiveTheme = (theme) => {
    if (theme === 'system') {
        return getSystemTheme()
    }
    return theme
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => getStoredTheme())
    const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveTheme(getStoredTheme()))

    useEffect(() => {
        const effective = getEffectiveTheme(theme)
        setEffectiveTheme(effective)

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', effective)
        
        // Save to localStorage
        try {
            if (theme === 'system') {
                localStorage.removeItem(THEME_KEY)
            } else {
                localStorage.setItem(THEME_KEY, theme)
            }
        } catch (error) {
            console.error('Failed to save theme:', error)
        }
    }, [theme])

    // Listen to system theme changes
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const newTheme = e.matches ? 'dark' : 'light'
            setEffectiveTheme(newTheme)
            document.documentElement.setAttribute('data-theme', newTheme)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'dark') return 'light'
            if (prev === 'light') return 'system'
            return 'dark'
        })
    }

    const setThemeDirect = (newTheme) => {
        setTheme(newTheme)
    }

    const value = {
        theme,
        effectiveTheme,
        toggleTheme,
        setTheme: setThemeDirect
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error('useTheme phải được dùng bên trong ThemeProvider')
    }
    return ctx
}

