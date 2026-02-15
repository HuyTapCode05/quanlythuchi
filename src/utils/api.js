const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api')

export const api = {
    // Users
    register: async (name, email, password) => {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Đăng ký thất bại')
        }
        return res.json()
    },

    login: async (email, password) => {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Đăng nhập thất bại')
        }
        return res.json()
    },

    // Categories
    getCategories: async (userId) => {
        const res = await fetch(`${API_URL}/categories/${userId}`)
        if (!res.ok) throw new Error('Lỗi khi tải danh mục')
        return res.json()
    },

    addCategory: async (category, userId) => {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...category, userId })
        })
        if (!res.ok) throw new Error('Lỗi khi thêm danh mục')
        return res.json()
    },

    updateCategory: async (id, category) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        })
        if (!res.ok) throw new Error('Lỗi khi cập nhật danh mục')
        return res.json()
    },

    deleteCategory: async (id) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Lỗi khi xóa danh mục')
        return res.json()
    },

    // Transactions
    getTransactions: async (userId) => {
        const res = await fetch(`${API_URL}/transactions/${userId}`)
        if (!res.ok) throw new Error('Lỗi khi tải giao dịch')
        return res.json()
    },

    addTransaction: async (transaction, userId) => {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...transaction, userId })
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Lỗi khi thêm giao dịch' }))
            throw new Error(error.error || 'Lỗi khi thêm giao dịch')
        }
        return res.json()
    },

    updateTransaction: async (id, transaction) => {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        })
        if (!res.ok) throw new Error('Lỗi khi cập nhật giao dịch')
        return res.json()
    },

    deleteTransaction: async (id) => {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Lỗi khi xóa giao dịch')
        return res.json()
    },

    // Budgets
    getBudgets: async (userId) => {
        const res = await fetch(`${API_URL}/budgets/${userId}`)
        if (!res.ok) throw new Error('Lỗi khi tải ngân sách')
        return res.json()
    },

    addBudget: async (budget, userId) => {
        const res = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...budget, userId })
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Lỗi khi thêm ngân sách' }))
            throw new Error(error.error || 'Lỗi khi thêm ngân sách')
        }
        return res.json()
    },

    updateBudget: async (id, budget) => {
        const res = await fetch(`${API_URL}/budgets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budget)
        })
        if (!res.ok) throw new Error('Lỗi khi cập nhật ngân sách')
        return res.json()
    },

    deleteBudget: async (id) => {
        const res = await fetch(`${API_URL}/budgets/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Lỗi khi xóa ngân sách')
        return res.json()
    },

    // Recurring Transactions
    getRecurring: async (userId) => {
        const res = await fetch(`${API_URL}/recurring/${userId}`)
        if (!res.ok) throw new Error('Lỗi khi tải giao dịch định kỳ')
        return res.json()
    },

    addRecurring: async (recurring, userId) => {
        const res = await fetch(`${API_URL}/recurring`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...recurring, userId })
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Lỗi khi thêm giao dịch định kỳ' }))
            throw new Error(error.error || 'Lỗi khi thêm giao dịch định kỳ')
        }
        return res.json()
    },

    updateRecurring: async (id, recurring) => {
        const res = await fetch(`${API_URL}/recurring/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recurring)
        })
        if (!res.ok) throw new Error('Lỗi khi cập nhật giao dịch định kỳ')
        return res.json()
    },

    deleteRecurring: async (id) => {
        const res = await fetch(`${API_URL}/recurring/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Lỗi khi xóa giao dịch định kỳ')
        return res.json()
    },

    // Savings Goals
    getSavingsGoals: async (userId) => {
        const res = await fetch(`${API_URL}/savings/${userId}`)
        if (!res.ok) throw new Error('Lỗi khi tải mục tiêu tiết kiệm')
        return res.json()
    },

    addSavingsGoal: async (goal, userId) => {
        const res = await fetch(`${API_URL}/savings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...goal, userId })
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Lỗi khi thêm mục tiêu tiết kiệm' }))
            throw new Error(error.error || 'Lỗi khi thêm mục tiêu tiết kiệm')
        }
        return res.json()
    },

    updateSavingsGoal: async (id, goal) => {
        const res = await fetch(`${API_URL}/savings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goal)
        })
        if (!res.ok) throw new Error('Lỗi khi cập nhật mục tiêu tiết kiệm')
        return res.json()
    },

    deleteSavingsGoal: async (id) => {
        const res = await fetch(`${API_URL}/savings/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Lỗi khi xóa mục tiêu tiết kiệm')
        return res.json()
    }
}

