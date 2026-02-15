import { useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './useAuth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useSavingsGoals() {
    const { user } = useAuth()
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            loadGoals()
        } else {
            setGoals([])
        }
    }, [user?.id])

    const loadGoals = useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const data = await api.getSavingsGoals(user.id)
            setGoals(data || [])
        } catch (error) {
            console.error('Load savings goals error:', error)
            setGoals([])
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    const addGoal = useCallback(async (data) => {
        const newGoal = {
            id: generateId(),
            name: data.name,
            targetAmount: Number(data.targetAmount),
            currentAmount: Number(data.currentAmount || 0),
            targetDate: data.targetDate || null,
            isCompleted: 0
        }

        if (!user?.id) {
            setGoals(prev => [...prev, newGoal])
            return newGoal
        }

        try {
            await api.addSavingsGoal(newGoal, user.id)
            setGoals(prev => [...prev, newGoal])
            return newGoal
        } catch (error) {
            console.error('Add savings goal error:', error)
            throw error
        }
    }, [user?.id])

    const updateGoal = useCallback(async (id, data) => {
        const updated = {
            name: data.name,
            targetAmount: Number(data.targetAmount),
            currentAmount: Number(data.currentAmount || 0),
            targetDate: data.targetDate || null,
            isCompleted: data.isCompleted !== undefined ? data.isCompleted : 0
        }

        if (!user?.id) {
            setGoals(prev =>
                prev.map(g => g.id === id ? { ...g, ...updated } : g)
            )
            return
        }

        try {
            await api.updateSavingsGoal(id, updated)
            setGoals(prev =>
                prev.map(g => g.id === id ? { ...g, ...updated } : g)
            )
        } catch (error) {
            console.error('Update savings goal error:', error)
            throw error
        }
    }, [user?.id])

    const deleteGoal = useCallback(async (id) => {
        if (!user?.id) {
            setGoals(prev => prev.filter(g => g.id !== id))
            return
        }

        try {
            await api.deleteSavingsGoal(id)
            setGoals(prev => prev.filter(g => g.id !== id))
        } catch (error) {
            console.error('Delete savings goal error:', error)
            throw error
        }
    }, [user?.id])

    const addToGoal = useCallback(async (id, amount) => {
        const goal = goals.find(g => g.id === id)
        if (!goal) return

        const newAmount = (goal.currentAmount || goal.current_amount || 0) + Number(amount)
        await updateGoal(id, { ...goal, currentAmount: newAmount })
    }, [goals, updateGoal])

    return {
        goals,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        addToGoal,
        reloadGoals: loadGoals
    }
}

