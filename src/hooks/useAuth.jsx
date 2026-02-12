import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'fintrack_users'
const CURRENT_USER_KEY = 'fintrack_current_user'

const loadUsers = () => {
    try {
        const raw = localStorage.getItem(USERS_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

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

    const login = (email, password) => {
        const users = loadUsers()
        const existing = users.find(u => u.email === email && u.password === password)
        if (!existing) {
            throw new Error('Email hoặc mật khẩu không đúng')
        }
        const safeUser = { id: existing.id, name: existing.name, email: existing.email }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
        setUser(safeUser)
    }

    const register = (name, email, password) => {
        const users = loadUsers()
        const existed = users.find(u => u.email === email)
        if (existed) {
            throw new Error('Email đã được sử dụng')
        }
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        }
        const updated = [...users, newUser]
        saveUsers(updated)
        const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
        setUser(safeUser)
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


