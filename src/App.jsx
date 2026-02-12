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
        getCategoryById
    } = useCategories()

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
                    isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
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
