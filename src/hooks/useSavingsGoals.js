import { useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './useAuth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useSavingsGoals() {
    const { user } = useAuth()
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(false)

    const normalizeGoal = (goal) => {
        return {
            id: goal.id,
            name: goal.name,
            targetAmount: goal.targetAmount || goal.target_amount || 0,
            currentAmount: goal.currentAmount || goal.current_amount || 0,
            targetDate: goal.targetDate || goal.target_date || null,
            isCompleted: goal.isCompleted !== undefined ? goal.isCompleted : (goal.is_completed !== undefined ? goal.is_completed : 0)
        }
    }

    const loadGoals = useCallback(async () => {
        if (!user?.id) {
            setGoals([])
            return
        }
        try {
            setLoading(true)
            const data = await api.getSavingsGoals(user.id)
            console.log('Raw data from API:', data)
            if (Array.isArray(data)) {
                // Normalize data từ snake_case sang camelCase
                const normalized = data.map(normalizeGoal)
                console.log('Normalized goals:', normalized)
                setGoals(normalized)
            } else {
                console.warn('Data is not an array:', data)
                setGoals([])
            }
        } catch (error) {
            console.error('Load savings goals error:', error)
            // Không reset về [] nếu có lỗi, giữ nguyên data cũ
            // setGoals([])
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (user?.id) {
            loadGoals()
        }
        // Không reset về [] khi user chưa load xong, giữ nguyên data cũ
    }, [user?.id, loadGoals])

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

        const current = goal.currentAmount || goal.current_amount || 0
        const target = goal.targetAmount || goal.target_amount || 0
        const newAmount = current + Number(amount)
        
        await updateGoal(id, { 
            name: goal.name,
            targetAmount: target,
            currentAmount: newAmount,
            targetDate: goal.targetDate || goal.target_date || null,
            isCompleted: goal.isCompleted || goal.is_completed || 0
        })
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

