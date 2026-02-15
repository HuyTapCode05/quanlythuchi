import { useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './useAuth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const normalizeTransaction = (raw) => ({
    id: raw.id || generateId(),
    type: raw.type === 'income' ? 'income' : 'expense',
    amount: Math.abs(Number(raw.amount) || 0),
    category: raw.category,
    note: raw.note || '',
    createdAt: raw.createdAt || new Date().toISOString()
})

export function useTransactions() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            loadTransactions()
        } else {
            setTransactions([])
        }
    }, [user?.id])

    const loadTransactions = async () => {
        try {
            setLoading(true)
            const data = await api.getTransactions(user.id)
            setTransactions(data.map(normalizeTransaction))
        } catch (error) {
            console.error('Load transactions error:', error)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    const addTransaction = useCallback(async (data) => {
        // Convert date to ISO string if provided
        let createdAt = new Date().toISOString()
        if (data.date) {
            const dateObj = new Date(data.date)
            dateObj.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
            createdAt = dateObj.toISOString()
        }
        
        const { date, ...restData } = data
        const newTx = normalizeTransaction({
            id: generateId(),
            ...restData,
            createdAt
        })
        
        if (!user?.id) {
            setTransactions(prev => [newTx, ...prev])
            return newTx
        }
        
        try {
            await api.addTransaction(newTx, user.id)
            setTransactions(prev => [newTx, ...prev])
            return newTx
        } catch (error) {
            console.error('Add transaction error:', error)
            throw error
        }
    }, [user?.id])

    const updateTransaction = useCallback(async (id, data) => {
        // Convert date to ISO string if provided
        let createdAt = data.createdAt || new Date().toISOString()
        if (data.date) {
            const dateObj = new Date(data.date)
            dateObj.setHours(12, 0, 0, 0)
            createdAt = dateObj.toISOString()
        }
        
        const { date, ...restData } = data
        const updated = normalizeTransaction({ 
            ...restData, 
            createdAt 
        })
        
        if (!user?.id) {
            setTransactions(prev =>
                prev.map(tx => tx.id === id ? updated : tx)
            )
            return
        }
        
        try {
            await api.updateTransaction(id, updated)
            setTransactions(prev =>
                prev.map(tx => tx.id === id ? updated : tx)
            )
        } catch (error) {
            console.error('Update transaction error:', error)
            throw error
        }
    }, [user?.id])

    const deleteTransaction = useCallback(async (id) => {
        if (!user?.id) {
            setTransactions(prev => prev.filter(tx => tx.id !== id))
            return
        }
        
        try {
            await api.deleteTransaction(id)
            setTransactions(prev => prev.filter(tx => tx.id !== id))
        } catch (error) {
            console.error('Delete transaction error:', error)
            throw error
        }
    }, [user?.id])

    const replaceAllTransactions = useCallback((list) => {
        if (!Array.isArray(list)) return
        const safe = list
            .filter(item => item && typeof item === 'object')
            .map(item => normalizeTransaction(item))
        setTransactions(safe)
    }, [])

    const getTransactionsSnapshot = useCallback(() => transactions, [transactions])

    const totalIncome = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0)

    const totalExpense = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0)

    const balance = totalIncome - totalExpense

    const getMonthlyData = useCallback(() => {
        const months = {}
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            months[key] = { month: `T${d.getMonth() + 1}`, income: 0, expense: 0 }
        }
        transactions.forEach(tx => {
            const d = new Date(tx.createdAt)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (months[key]) {
                months[key][tx.type] += tx.amount
            }
        })
        return Object.values(months)
    }, [transactions])

    const getCategoryBreakdown = useCallback((type = 'expense') => {
        const cats = {}
        transactions.filter(tx => tx.type === type).forEach(tx => {
            if (!cats[tx.category]) cats[tx.category] = 0
            cats[tx.category] += tx.amount
        })
        return Object.entries(cats).map(([name, value]) => ({ name, value }))
    }, [transactions])

    return {
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        replaceAllTransactions,
        getTransactionsSnapshot,
        totalIncome,
        totalExpense,
        balance,
        getMonthlyData,
        getCategoryBreakdown
    }
}
