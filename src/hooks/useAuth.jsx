import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)
const CURRENT_USER_KEY = 'fintrack_current_user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CURRENT_USER_KEY)
            if (raw) {
                setUser(JSON.parse(raw))
            }
        } catch {
            setUser(null)
        }
    }, [])

    const login = async (email, password) => {
        const userData = await api.login(email, password)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
        setUser(userData)
    }

    const register = async (name, email, password) => {
        const userData = await api.register(name, email, password)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem(CURRENT_USER_KEY)
        setUser(null)
    }

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth phải được dùng bên trong AuthProvider')
    }
    return ctx
}


