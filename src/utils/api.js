const API_URL = 'http://localhost:3001/api'

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
    }
}

