import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)
const CURRENT_USER_KEY = 'fintrack_current_user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        let cancelled = false
        const init = async () => {
            try {
                const raw = localStorage.getItem(CURRENT_USER_KEY)
                if (!raw) return
                const cached = JSON.parse(raw)
                if (!cached?.id) return

                // Validate user tồn tại trên DB (tránh stale localStorage)
                const fresh = await api.getUser(cached.id)
                if (cancelled) return
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh))
                setUser(fresh)
            } catch {
                // Nếu user không còn tồn tại / lỗi parse -> logout local
                localStorage.removeItem(CURRENT_USER_KEY)
                if (!cancelled) setUser(null)
            }
        }
        init()
        return () => { cancelled = true }
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

    const updateProfile = async (data) => {
        if (!user?.id) return
        const updated = await api.updateProfile(user.id, data)
        const merged = { ...user, ...updated }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged))
        setUser(merged)
        return merged
    }

    const changePassword = async (currentPassword, newPassword) => {
        if (!user?.id) return
        return api.changePassword(user.id, currentPassword, newPassword)
    }

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword
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


