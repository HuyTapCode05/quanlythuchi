import { useState, useCallback } from 'react'

const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Ăn uống', color: '#ff6b6b', icon: '🍔', type: 'expense' },
    { id: '2', name: 'Di chuyển', color: '#ffa502', icon: '🚗', type: 'expense' },
    { id: '3', name: 'Mua sắm', color: '#ff6348', icon: '🛒', type: 'expense' },
    { id: '4', name: 'Giải trí', color: '#a55eea', icon: '🎮', type: 'expense' },
    { id: '5', name: 'Hóa đơn', color: '#1e90ff', icon: '📄', type: 'expense' },
    { id: '6', name: 'Sức khỏe', color: '#2ed573', icon: '💊', type: 'expense' },
    { id: '7', name: 'Giáo dục', color: '#00cec9', icon: '📚', type: 'expense' },
    { id: '8', name: 'Khác', color: '#9d9dba', icon: '📌', type: 'expense' },
    { id: '9', name: 'Lương', color: '#00b894', icon: '💰', type: 'income' },
    { id: '10', name: 'Thưởng', color: '#2ed573', icon: '🎁', type: 'income' },
    { id: '11', name: 'Đầu tư', color: '#6c5ce7', icon: '📈', type: 'income' },
    { id: '12', name: 'Freelance', color: '#00cec9', icon: '💻', type: 'income' },
    { id: '13', name: 'Thu nhập khác', color: '#9d9dba', icon: '💵', type: 'income' },
]

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useCategories() {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

    const addCategory = useCallback((data) => {
        const newCat = { id: generateId(), ...data }
        setCategories(prev => [...prev, newCat])
        return newCat
    }, [])

    const updateCategory = useCallback((id, data) => {
        setCategories(prev =>
            prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
        )
    }, [])

    const deleteCategory = useCallback((id) => {
        setCategories(prev => prev.filter(cat => cat.id !== id))
    }, [])

    const replaceAllCategories = useCallback((list) => {
        if (!Array.isArray(list)) return
        const safe = list
            .filter(item => item && typeof item === 'object')
            .map(item => ({
                id: item.id || generateId(),
                name: item.name || 'Chưa đặt tên',
                color: item.color || '#9d9dba',
                icon: item.icon || '📌',
                type: item.type === 'income' ? 'income' : 'expense'
            }))
        setCategories(safe.length ? safe : DEFAULT_CATEGORIES)
    }, [])

    const resetDefaultCategories = useCallback(() => {
        setCategories(DEFAULT_CATEGORIES)
    }, [])

    const getCategoriesSnapshot = useCallback(() => categories, [categories])

    const getByType = useCallback((type) => {
        return categories.filter(cat => cat.type === type)
    }, [categories])

    const getCategoryById = useCallback((id) => {
        return categories.find(cat => cat.id === id)
    }, [categories])

    return {
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        replaceAllCategories,
        resetDefaultCategories,
        getCategoriesSnapshot,
        getByType,
        getCategoryById
    }
}
