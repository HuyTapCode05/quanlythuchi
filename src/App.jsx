import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Income from './pages/Income/Income'
import Expense from './pages/Expense/Expense'
import Categories from './pages/Categories/Categories'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import { exportToDB, importFromDB } from './utils/dbExport'

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

    const handleExportData = async () => {
        try {
            const categories = getCategoriesSnapshot()
            const transactions = getTransactionsSnapshot()
            const dbData = await exportToDB(categories, transactions)
            const blob = new Blob([dbData], { type: 'application/x-sqlite3' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'fintrack-data.db'
            a.click()
            URL.revokeObjectURL(url)
            alert('Đã xuất file database thành công!')
        } catch (error) {
            console.error('Export error:', error)
            alert('Lỗi khi xuất file database. Vui lòng thử lại.')
        }
    }

    const handleImportData = async (dbFile) => {
        try {
            const { categories, transactions } = await importFromDB(dbFile)
            if (categories.length > 0) {
                replaceAllCategories(categories)
            }
            if (transactions.length > 0) {
                replaceAllTransactions(transactions)
            }
        } catch (error) {
            console.error('Import error:', error)
            alert('Lỗi khi đọc file database. Vui lòng chọn đúng file .db từ FinTrack.')
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
                    path="/income"
                    element={
                        <Income
                            transactions={transactions}
                            categories={categories}
                            addTransaction={addTransaction}
                            updateTransaction={updateTransaction}
                            deleteTransaction={deleteTransaction}
                        />
                    }
                />
                <Route
                    path="/expense"
                    element={
                        <Expense
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
