import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Transactions from './pages/Transactions/Transactions'
import Categories from './pages/Categories/Categories'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

export default function App() {
    const { isAuthenticated } = useAuth()
    const {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        balance,
        getMonthlyData,
        getCategoryBreakdown
    } = useTransactions()

    const {
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getByType,
        getCategoryById,
        replaceAllCategories,
        getCategoriesSnapshot
    } = useCategories()

    const {
        replaceAllTransactions,
        getTransactionsSnapshot
    } = useTransactions()

    const handleExportData = () => {
        const data = {
            categories: getCategoriesSnapshot(),
            transactions: getTransactionsSnapshot()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fintrack-data.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImportData = (data) => {
        if (!data || typeof data !== 'object') return
        if (Array.isArray(data.categories) || Array.isArray(data.transactions)) {
            if (Array.isArray(data.categories)) {
                replaceAllCategories(data.categories)
            }
            if (Array.isArray(data.transactions)) {
                replaceAllTransactions(data.transactions)
            }
        }
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Register />
                }
            />

            <Route
                element={
                    isAuthenticated ? (
                        <Layout
                            onExportData={handleExportData}
                            onImportData={handleImportData}
                        />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route
                    index
                    element={
                        <Dashboard
                            transactions={transactions}
                            categories={categories}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            balance={balance}
                            getMonthlyData={getMonthlyData}
                            getCategoryBreakdown={getCategoryBreakdown}
                        />
                    }
                />
                <Route
                    path="/transactions"
                    element={
                        <Transactions
                            transactions={transactions}
                            categories={categories}
                            addTransaction={addTransaction}
                            updateTransaction={updateTransaction}
                            deleteTransaction={deleteTransaction}
                        />
                    }
                />
                <Route
                    path="/categories"
                    element={
                        <Categories
                            categories={categories}
                            addCategory={addCategory}
                            updateCategory={updateCategory}
                            deleteCategory={deleteCategory}
                        />
                    }
                />
            </Route>
        </Routes>
    )
}
