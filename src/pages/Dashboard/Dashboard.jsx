import {
    TrendingUp, TrendingDown, Wallet, ArrowRight,
    Plus
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Link } from 'react-router-dom'
import { formatCurrency, getRelativeTime, CHART_COLORS } from '../../utils/helpers'
import './Dashboard.css'

export default function Dashboard({ transactions, categories, totalIncome, totalExpense, balance, getMonthlyData, getCategoryBreakdown }) {
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

    return (
        <div className="dashboard">
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
