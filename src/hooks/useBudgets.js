import { useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './useAuth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useBudgets() {
    const { user } = useAuth()
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            loadBudgets()
        } else {
            setBudgets([])
        }
    }, [user?.id])

    const loadBudgets = useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const data = await api.getBudgets(user.id)
            setBudgets(data || [])
        } catch (error) {
            console.error('Load budgets error:', error)
            setBudgets([])
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    const addBudget = useCallback(async (data) => {
        const newBudget = {
            id: generateId(),
            categoryId: data.categoryId,
            amount: Number(data.amount),
            period: data.period || 'month'
        }

        if (!user?.id) {
            setBudgets(prev => [...prev, newBudget])
            return newBudget
        }

        try {
            await api.addBudget(newBudget, user.id)
            setBudgets(prev => [...prev, newBudget])
            return newBudget
        } catch (error) {
            console.error('Add budget error:', error)
            throw error
        }
    }, [user?.id])

    const updateBudget = useCallback(async (id, data) => {
        const updated = {
            categoryId: data.categoryId,
            amount: Number(data.amount),
            period: data.period || 'month'
        }

        if (!user?.id) {
            setBudgets(prev =>
                prev.map(b => b.id === id ? { ...b, ...updated } : b)
            )
            return
        }

        try {
            await api.updateBudget(id, updated)
            setBudgets(prev =>
                prev.map(b => b.id === id ? { ...b, ...updated } : b)
            )
        } catch (error) {
            console.error('Update budget error:', error)
            throw error
        }
    }, [user?.id])

    const deleteBudget = useCallback(async (id) => {
        if (!user?.id) {
            setBudgets(prev => prev.filter(b => b.id !== id))
            return
        }

        try {
            await api.deleteBudget(id)
            setBudgets(prev => prev.filter(b => b.id !== id))
        } catch (error) {
            console.error('Delete budget error:', error)
            throw error
        }
    }, [user?.id])

    const getBudgetByCategory = useCallback((categoryId, period = 'month') => {
        return budgets.find(b => b.categoryId === categoryId && b.period === period)
    }, [budgets])

    const getBudgetsByPeriod = useCallback((period = 'month') => {
        return budgets.filter(b => b.period === period)
    }, [budgets])

    return {
        budgets,
        loading,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetByCategory,
        getBudgetsByPeriod,
        reloadBudgets: loadBudgets
    }
}

