import { useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './useAuth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useRecurringTransactions() {
    const { user } = useAuth()
    const [recurring, setRecurring] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            loadRecurring()
        } else {
            setRecurring([])
        }
    }, [user?.id])

    const loadRecurring = useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const data = await api.getRecurring(user.id)
            setRecurring(data || [])
        } catch (error) {
            console.error('Load recurring error:', error)
            setRecurring([])
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    const addRecurring = useCallback(async (data) => {
        const newRecurring = {
            id: generateId(),
            type: data.type,
            amount: Number(data.amount),
            categoryId: data.categoryId || '',
            note: data.note || '',
            frequency: data.frequency,
            startDate: data.startDate,
            endDate: data.endDate || null,
            nextDate: data.nextDate || data.startDate,
            isActive: data.isActive !== undefined ? data.isActive : 1
        }

        if (!user?.id) {
            setRecurring(prev => [...prev, newRecurring])
            return newRecurring
        }

        try {
            await api.addRecurring(newRecurring, user.id)
            setRecurring(prev => [...prev, newRecurring])
            return newRecurring
        } catch (error) {
            console.error('Add recurring error:', error)
            throw error
        }
    }, [user?.id])

    const updateRecurring = useCallback(async (id, data) => {
        const updated = {
            type: data.type,
            amount: Number(data.amount),
            categoryId: data.categoryId || '',
            note: data.note || '',
            frequency: data.frequency,
            startDate: data.startDate,
            endDate: data.endDate || null,
            nextDate: data.nextDate || data.startDate,
            isActive: data.isActive !== undefined ? data.isActive : 1
        }

        if (!user?.id) {
            setRecurring(prev =>
                prev.map(r => r.id === id ? { ...r, ...updated } : r)
            )
            return
        }

        try {
            await api.updateRecurring(id, updated)
            setRecurring(prev =>
                prev.map(r => r.id === id ? { ...r, ...updated } : r)
            )
        } catch (error) {
            console.error('Update recurring error:', error)
            throw error
        }
    }, [user?.id])

    const deleteRecurring = useCallback(async (id) => {
        if (!user?.id) {
            setRecurring(prev => prev.filter(r => r.id !== id))
            return
        }

        try {
            await api.deleteRecurring(id)
            setRecurring(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error('Delete recurring error:', error)
            throw error
        }
    }, [user?.id])

    const toggleActive = useCallback(async (id, isActive) => {
        const item = recurring.find(r => r.id === id)
        if (!item) return

        await updateRecurring(id, { ...item, isActive: isActive ? 1 : 0 })
    }, [recurring, updateRecurring])

    return {
        recurring,
        loading,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleActive,
        reloadRecurring: loadRecurring
    }
}

