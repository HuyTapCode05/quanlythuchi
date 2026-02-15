import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Calendar, PieChart as PieChartIcon } from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { CHART_COLORS } from '../../utils/helpers'
import './Statistics.css'

export default function Statistics({ transactions, categories, totalIncome, totalExpense }) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Monthly comparison (12 tháng gần nhất)
    const monthlyComparison = useMemo(() => {
        const months = []
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1)
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
            
            const monthIncome = transactions
                .filter(tx => 
                    tx.type === 'income' &&
                    new Date(tx.createdAt) >= monthStart &&
                    new Date(tx.createdAt) <= monthEnd
                )
                .reduce((sum, tx) => sum + tx.amount, 0)
            
            const monthExpense = transactions
                .filter(tx => 
                    tx.type === 'expense' &&
                    new Date(tx.createdAt) >= monthStart &&
                    new Date(tx.createdAt) <= monthEnd
                )
                .reduce((sum, tx) => sum + tx.amount, 0)
            
            months.push({
                month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                monthShort: `T${date.getMonth() + 1}`,
                income: monthIncome,
                expense: monthExpense,
                balance: monthIncome - monthExpense
            })
        }
        return months
    }, [transactions, currentYear, currentMonth])

    // Category breakdown (top 10)
    const categoryBreakdown = useMemo(() => {
        const expenseTx = transactions.filter(tx => tx.type === 'expense')
        const categoryMap = {}
        
        expenseTx.forEach(tx => {
            const catId = tx.category
            if (!catId) return
            
            const cat = categories.find(c => c.id === catId)
            const catName = cat ? `${cat.icon} ${cat.name}` : 'Không rõ'
            
            if (!categoryMap[catName]) {
                categoryMap[catName] = {
                    name: catName,
                    amount: 0,
                    color: cat?.color || CHART_COLORS[0],
                    count: 0
                }
            }
            categoryMap[catName].amount += tx.amount
            categoryMap[catName].count += 1
        })
        
        return Object.values(categoryMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10)
    }, [transactions, categories])

    // Weekly trend (8 tuần gần nhất)
    const weeklyTrend = useMemo(() => {
        const weeks = []
        for (let i = 7; i >= 0; i--) {
            const weekEnd = new Date(now)
            weekEnd.setDate(now.getDate() - (i * 7))
            weekEnd.setHours(23, 59, 59, 999)
            
            const weekStart = new Date(weekEnd)
            weekStart.setDate(weekEnd.getDate() - 6)
            weekStart.setHours(0, 0, 0, 0)
            
            const weekIncome = transactions
                .filter(tx => 
                    tx.type === 'income' &&
                    new Date(tx.createdAt) >= weekStart &&
                    new Date(tx.createdAt) <= weekEnd
                )
                .reduce((sum, tx) => sum + tx.amount, 0)
            
            const weekExpense = transactions
                .filter(tx => 
                    tx.type === 'expense' &&
                    new Date(tx.createdAt) >= weekStart &&
                    new Date(tx.createdAt) <= weekEnd
                )
                .reduce((sum, tx) => sum + tx.amount, 0)
            
            weeks.push({
                week: `Tuần ${8 - i}`,
                date: weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                income: weekIncome,
                expense: weekExpense
            })
        }
        return weeks
    }, [transactions, now])

    // Top months
    const topMonths = useMemo(() => {
        return monthlyComparison
            .map((m, idx) => ({ ...m, index: idx }))
            .sort((a, b) => b.income - a.income)
            .slice(0, 5)
    }, [monthlyComparison])

    // Top categories
    const topCategories = useMemo(() => {
        return categoryBreakdown.slice(0, 5)
    }, [categoryBreakdown])

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip__label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name === 'income' ? 'Thu' : p.name === 'expense' ? 'Chi' : p.name}: {formatCurrency(p.value)}
                    </p>
                ))}
            </div>
        )
    }

    return (
        <div className="statistics-page">
            {/* Header */}
            <div className="statistics-page__header">
                <div>
                    <h1 className="statistics-page__title">
                        <BarChart3 size={24} />
                        Thống kê nâng cao
                    </h1>
                    <p className="statistics-page__subtitle">
                        Phân tích chi tiết thu chi và xu hướng tài chính
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="statistics-page__summary">
                <div className="stat-card income">
                    <div className="stat-card__icon">
                        <TrendingUp size={22} />
                    </div>
                    <p className="stat-card__label">Tổng thu nhập</p>
                    <p className="stat-card__value">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="stat-card expense">
                    <div className="stat-card__icon">
                        <TrendingDown size={22} />
                    </div>
                    <p className="stat-card__label">Tổng chi tiêu</p>
                    <p className="stat-card__value">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="stat-card balance">
                    <div className="stat-card__icon">
                        <Calendar size={22} />
                    </div>
                    <p className="stat-card__label">Số dư</p>
                    <p className="stat-card__value" style={{ color: (totalIncome - totalExpense) >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon">
                        <PieChartIcon size={22} />
                    </div>
                    <p className="stat-card__label">Tổng giao dịch</p>
                    <p className="stat-card__value">{transactions.length}</p>
                </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="chart-card animate-fade-in-up">
                <div className="chart-card__header">
                    <h3 className="chart-card__title">So sánh thu chi 12 tháng</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis 
                            dataKey="monthShort" 
                            stroke="var(--text-secondary)"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            stroke="var(--text-secondary)"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="income" fill="var(--income-color)" name="Thu nhập" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="var(--expense-color)" name="Chi tiêu" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Charts Grid */}
            <div className="statistics-page__charts-grid">
                {/* Weekly Trend */}
                <div className="chart-card animate-fade-in-up">
                    <div className="chart-card__header">
                        <h3 className="chart-card__title">Xu hướng 8 tuần gần đây</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={weeklyTrend}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--income-color)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--income-color)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--expense-color)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--expense-color)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '11px' }}
                            />
                            <YAxis 
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '11px' }}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="income" stroke="var(--income-color)" fill="url(#incomeGrad)" name="Thu nhập" />
                            <Area type="monotone" dataKey="expense" stroke="var(--expense-color)" fill="url(#expenseGrad)" name="Chi tiêu" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="chart-card animate-fade-in-up">
                    <div className="chart-card__header">
                        <h3 className="chart-card__title">Top 10 danh mục chi tiêu</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="amount"
                            >
                                {categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Lists */}
            <div className="statistics-page__lists-grid">
                {/* Top Months */}
                <div className="statistics-page__list-card">
                    <h3 className="statistics-page__list-title">Top 5 tháng thu nhập cao nhất</h3>
                    <div className="statistics-page__list">
                        {topMonths.map((month, idx) => (
                            <div key={idx} className="statistics-page__list-item">
                                <div className="statistics-page__list-item-left">
                                    <span className="statistics-page__list-rank">#{idx + 1}</span>
                                    <span className="statistics-page__list-name">{month.month}</span>
                                </div>
                                <span className="statistics-page__list-value text-income">
                                    {formatCurrency(month.income)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Categories */}
                <div className="statistics-page__list-card">
                    <h3 className="statistics-page__list-title">Top 5 danh mục chi tiêu</h3>
                    <div className="statistics-page__list">
                        {topCategories.map((cat, idx) => (
                            <div key={idx} className="statistics-page__list-item">
                                <div className="statistics-page__list-item-left">
                                    <span className="statistics-page__list-rank">#{idx + 1}</span>
                                    <span className="statistics-page__list-name">{cat.name}</span>
                                </div>
                                <div className="statistics-page__list-item-right">
                                    <span className="statistics-page__list-value text-expense">
                                        {formatCurrency(cat.amount)}
                                    </span>
                                    <span className="statistics-page__list-count">
                                        ({cat.count} giao dịch)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

