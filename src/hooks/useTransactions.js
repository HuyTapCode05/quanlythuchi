import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'expense_tracker_transactions'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

const saveToStorage = (transactions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function useTransactions() {
    const [transactions, setTransactions] = useState(loadFromStorage)

    useEffect(() => {
        saveToStorage(transactions)
    }, [transactions])

    const addTransaction = useCallback((data) => {
        const newTx = {
            id: generateId(),
            ...data,
            amount: Math.abs(Number(data.amount)),
            createdAt: new Date().toISOString()
        }
        setTransactions(prev => [newTx, ...prev])
        return newTx
    }, [])

    const updateTransaction = useCallback((id, data) => {
        setTransactions(prev =>
            prev.map(tx => tx.id === id ? { ...tx, ...data, amount: Math.abs(Number(data.amount)) } : tx)
        )
    }, [])

    const deleteTransaction = useCallback((id) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id))
    }, [])

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
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        balance,
        getMonthlyData,
        getCategoryBreakdown
    }
}
