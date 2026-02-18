import {
    TrendingUp, TrendingDown, Wallet, ArrowRight,
    Plus, ArrowUpRight, ArrowDownRight, BellRing
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Link } from 'react-router-dom'
import { formatCurrency, getRelativeTime, CHART_COLORS } from '../../utils/helpers'
import './Dashboard.css'

export default function Dashboard({ transactions, categories, totalIncome, totalExpense, balance, getMonthlyData, getCategoryBreakdown, recurring = [] }) {
    const monthlyData = getMonthlyData()
    const catBreakdown = getCategoryBreakdown('expense')
    const recentTx = transactions.slice(0, 6)

    const getCat = (id) => categories.find(c => c.id === id)

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip__label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name === 'income' ? 'Thu' : 'Chi'}: {formatCurrency(p.value)}
                    </p>
                ))}
            </div>
        )
    }

    // So sánh tháng này với tháng trước
    const getMonthStats = (year, month) => {
        let income = 0
        let expense = 0
        transactions.forEach(tx => {
            const d = new Date(tx.createdAt)
            if (d.getFullYear() === year && d.getMonth() === month) {
                if (tx.type === 'income') income += tx.amount
                if (tx.type === 'expense') expense += tx.amount
            }
        })
        return { income, expense }
    }

    const now = new Date()
    const currentStats = getMonthStats(now.getFullYear(), now.getMonth())
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevStats = getMonthStats(prevDate.getFullYear(), prevDate.getMonth())

    const calcChange = (current, previous) => {
        if (!previous) return null
        if (previous === 0 && current === 0) return 0
        if (previous === 0) return null // Không tính % khi tháng trước = 0 nhưng tháng này có giao dịch
        return ((current - previous) / previous) * 100
    }

    const incomeChange = calcChange(currentStats.income, prevStats.income)
    const expenseChange = calcChange(currentStats.expense, prevStats.expense)

    // Nhắc nhở định kỳ sắp đến hạn
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffInDays = (dateStr) => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        d.setHours(0, 0, 0, 0)
        const diffMs = d.getTime() - today.getTime()
        return Math.round(diffMs / (1000 * 60 * 60 * 24))
    }

    const upcomingRecurring = Array.isArray(recurring)
        ? recurring
            .filter(r => r.isActive === 1)
            .map(r => {
                const next = r.nextDate || r.next_date
                const days = diffInDays(next)
                return { ...r, _daysUntilNext: days }
            })
            .filter(r => r._daysUntilNext !== null && r._daysUntilNext <= 3)
            .sort((a, b) => (a._daysUntilNext ?? 0) - (b._daysUntilNext ?? 0))
            .slice(0, 4)
        : []

    return (
        <div className="dashboard">
            {/* Recurring Alerts */}
            {upcomingRecurring.length > 0 && (
                <div className="dashboard__recurring-alert animate-fade-in-up">
                    <div className="dashboard__recurring-alert-header">
                        <div className="dashboard__recurring-alert-title-wrap">
                            <div className="dashboard__recurring-alert-icon">
                                <BellRing size={16} />
                            </div>
                            <div>
                                <p className="dashboard__recurring-alert-title">
                                    Nhắc nhở định kỳ
                                </p>
                                <p className="dashboard__recurring-alert-sub">
                                    Có {upcomingRecurring.length} giao dịch định kỳ sắp đến hạn trong 3 ngày tới
                                </p>
                            </div>
                        </div>
                        <Link to="/recurring" className="dashboard__recurring-alert-link">
                            Xem tất cả
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="dashboard__recurring-alert-list">
                        {upcomingRecurring.map(item => {
                            const cat = categories.find(c => c.id === (item.categoryId || item.category_id))
                            const days = item._daysUntilNext ?? 0
                            const label = days < 0
                                ? 'Đã quá hạn'
                                : days === 0
                                    ? 'Hôm nay'
                                    : `Còn ${days} ngày`
                            return (
                                <div key={item.id} className="dashboard__recurring-alert-item">
                                    <div className="dashboard__recurring-alert-left">
                                        <div
                                            className="dashboard__recurring-alert-avatar"
                                            style={{ background: cat?.color ? `${cat.color}22` : 'var(--bg-input)' }}
                                        >
                                            <span>{cat?.icon || '🔁'}</span>
                                        </div>
                                        <div className="dashboard__recurring-alert-text">
                                            <p className="dashboard__recurring-alert-name">
                                                {cat ? `${cat.icon} ${cat.name}` : 'Giao dịch định kỳ'}
                                            </p>
                                            <p className="dashboard__recurring-alert-meta">
                                                {item.note || (item.type === 'income' ? 'Thu nhập định kỳ' : 'Chi tiêu định kỳ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="dashboard__recurring-alert-right">
                                        <p className={`dashboard__recurring-alert-amount ${item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                        </p>
                                        <span className="dashboard__recurring-alert-badge">
                                            {label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Month Compare Banner */}
            <div className="dashboard__month-compare animate-fade-in-up">
                <div className="dashboard__month-compare-header">
                    <span className="dashboard__month-compare-title">So với tháng trước</span>
                    <span className="dashboard__month-compare-sub">
                        Tháng này so với {`T${prevDate.getMonth() + 1}/${prevDate.getFullYear()}`}
                    </span>
                </div>
                <div className="dashboard__month-compare-grid">
                    <div className="dashboard__month-compare-item dashboard__month-compare-item--income">
                        <div className="dashboard__month-compare-label">
                            <span>Thu nhập</span>
                        </div>
                        <div className="dashboard__month-compare-values">
                            <span className="dashboard__month-compare-current">
                                {formatCurrency(currentStats.income)}
                            </span>
                            <span className="dashboard__month-compare-prev">
                                Tháng trước: {formatCurrency(prevStats.income)}
                            </span>
                        </div>
                        {incomeChange !== null && (
                            <div className={`dashboard__month-compare-change ${incomeChange >= 0 ? 'is-up' : 'is-down'}`}>
                                {incomeChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                <span>
                                    {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                                </span>
                                <span className="dashboard__month-compare-chip">
                                    {incomeChange >= 0 ? 'Thu tăng' : 'Thu giảm'}
                                </span>
                            </div>
                        )}
                        {incomeChange === null && (
                            <div className="dashboard__month-compare-note">
                                Chưa đủ dữ liệu để so sánh.
                            </div>
                        )}
                    </div>

                    <div className="dashboard__month-compare-item dashboard__month-compare-item--expense">
                        <div className="dashboard__month-compare-label">
                            <span>Chi tiêu</span>
                        </div>
                        <div className="dashboard__month-compare-values">
                            <span className="dashboard__month-compare-current text-expense">
                                {formatCurrency(currentStats.expense)}
                            </span>
                            <span className="dashboard__month-compare-prev">
                                Tháng trước: {formatCurrency(prevStats.expense)}
                            </span>
                        </div>
                        {expenseChange !== null && (
                            <div className={`dashboard__month-compare-change ${expenseChange <= 0 ? 'is-up' : 'is-down'}`}>
                                {/* Với chi tiêu: giảm là tốt (màu xanh, mũi tên xuống) */}
                                {expenseChange <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                <span>
                                    {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                                </span>
                                <span className="dashboard__month-compare-chip">
                                    {expenseChange <= 0 ? 'Chi giảm' : 'Chi tăng'}
                                </span>
                            </div>
                        )}
                        {expenseChange === null && (
                            <div className="dashboard__month-compare-note">
                                Chưa đủ dữ liệu để so sánh.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="dashboard__stats">
                <div className="stat-card income animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="stat-card__icon">
                        <TrendingUp size={22} />
                    </div>
                    <p className="stat-card__label">Tổng thu nhập</p>
                    <p className="stat-card__value">{formatCurrency(totalIncome)}</p>
                </div>

                <div className="stat-card expense animate-fade-in-up" style={{ animationDelay: '80ms' }}>
                    <div className="stat-card__icon">
                        <TrendingDown size={22} />
                    </div>
                    <p className="stat-card__label">Tổng chi tiêu</p>
                    <p className="stat-card__value">{formatCurrency(totalExpense)}</p>
                </div>

                <div className="stat-card balance animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                    <div className="stat-card__icon">
                        <Wallet size={22} />
                    </div>
                    <p className="stat-card__label">Số dư hiện tại</p>
                    <p className="stat-card__value" style={{ color: balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
                        {formatCurrency(balance)}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard__charts">
                {/* Area Chart */}
                <div className="chart-card animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                    <div className="chart-card__header">
                        <h3 className="chart-card__title">Biểu đồ thu chi 6 tháng</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00b894" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#00b894" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="income" stroke="#00b894" fill="url(#incomeGrad)" strokeWidth={2} dot={false} name="income" />
                            <Area type="monotone" dataKey="expense" stroke="#ff6b6b" fill="url(#expenseGrad)" strokeWidth={2} dot={false} name="expense" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="chart-card animate-fade-in-up" style={{ animationDelay: '320ms' }}>
                    <div className="chart-card__header">
                        <h3 className="chart-card__title">Chi tiêu theo danh mục</h3>
                    </div>
                    {catBreakdown.length > 0 ? (
                        <div className="dashboard__pie-wrap">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={catBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        dataKey="value"
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {catBreakdown.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="dashboard__pie-legend">
                                {catBreakdown.map((item, i) => {
                                    const cat = getCat(item.name)
                                    return (
                                        <div key={i} className="dashboard__pie-legend-item">
                                            <span className="dashboard__pie-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                                            <span className="truncate">{cat ? `${cat.icon} ${cat.name}` : item.name}</span>
                                            <span className="text-secondary" style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)' }}>{formatCurrency(item.value)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <p className="text-muted">Chưa có dữ liệu chi tiêu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="chart-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="chart-card__header">
                    <h3 className="chart-card__title">Giao dịch gần đây</h3>
                    <Link to="/transactions" className="btn btn-ghost btn-sm">
                        Xem tất cả <ArrowRight size={14} />
                    </Link>
                </div>

                {recentTx.length > 0 ? (
                    <div className="dashboard__tx-list">
                        {recentTx.map(tx => {
                            const cat = getCat(tx.category)
                            return (
                                <div key={tx.id} className="dashboard__tx-item">
                                    <div className="dashboard__tx-icon" style={{ background: cat?.color ? `${cat.color}18` : 'var(--bg-input)', color: cat?.color || 'var(--text-muted)' }}>
                                        <span>{cat?.icon || '💸'}</span>
                                    </div>
                                    <div className="dashboard__tx-info">
                                        <p className="dashboard__tx-name">{cat?.name || 'Không rõ'}</p>
                                        <p className="dashboard__tx-meta">
                                            {tx.note && <span>{tx.note} · </span>}
                                            {getRelativeTime(tx.createdAt)}
                                        </p>
                                    </div>
                                    <p className={`dashboard__tx-amount ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Plus size={28} /></div>
                        <p className="empty-state__title">Chưa có giao dịch</p>
                        <p className="empty-state__desc">Hãy bắt đầu ghi nhận thu chi hàng ngày để quản lý tài chính tốt hơn.</p>
                        <Link to="/transactions" className="btn btn-primary">
                            <Plus size={16} /> Thêm giao dịch
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
