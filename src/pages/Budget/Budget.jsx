import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Target, AlertCircle, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatCurrency } from '../../utils/helpers'
import './Budget.css'

const PERIOD_OPTIONS = [
    { value: 'month', label: 'Tháng' },
    { value: 'week', label: 'Tuần' },
    { value: 'year', label: 'Năm' }
]

export default function Budget({ budgets, categories, transactions, addBudget, updateBudget, deleteBudget }) {
    const [showModal, setShowModal] = useState(false)
    const [editBudget, setEditBudget] = useState(null)
    const [form, setForm] = useState({ categoryId: '', amount: '', period: 'month' })
    const [filterPeriod, setFilterPeriod] = useState('month')

    const expenseCategories = categories.filter(c => c.type === 'expense')
    const filteredBudgets = budgets.filter(b => b.period === filterPeriod)

    // Tính toán chi tiêu thực tế cho mỗi ngân sách
    const budgetsWithSpending = useMemo(() => {
        const now = new Date()
        let startDate, endDate

        switch (filterPeriod) {
            case 'week':
                startDate = new Date(now)
                startDate.setDate(now.getDate() - now.getDay())
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(startDate)
                endDate.setDate(startDate.getDate() + 6)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                break
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1)
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
                break
            default:
                startDate = new Date(0)
                endDate = new Date()
        }

        return filteredBudgets.map(budget => {
            const spending = transactions
                .filter(tx => 
                    tx.type === 'expense' &&
                    tx.category === budget.categoryId &&
                    new Date(tx.createdAt) >= startDate &&
                    new Date(tx.createdAt) <= endDate
                )
                .reduce((sum, tx) => sum + tx.amount, 0)

            const percentage = (spending / budget.amount) * 100
            const remaining = budget.amount - spending
            const isOverBudget = spending > budget.amount

            return {
                ...budget,
                spending,
                percentage: Math.min(percentage, 100),
                remaining,
                isOverBudget
            }
        })
    }, [filteredBudgets, transactions, filterPeriod])

    const getCategory = (id) => categories.find(c => c.id === id)

    const openAdd = () => {
        setEditBudget(null)
        setForm({ categoryId: '', amount: '', period: filterPeriod })
        setShowModal(true)
    }

    const openEdit = (budget) => {
        setEditBudget(budget)
        setForm({
            categoryId: budget.categoryId,
            amount: budget.amount,
            period: budget.period
        })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.categoryId || !form.amount) return

        if (editBudget) {
            updateBudget(editBudget.id, form)
        } else {
            addBudget(form)
        }
        setShowModal(false)
        setEditBudget(null)
    }

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa ngân sách này?')) {
            deleteBudget(id)
        }
    }

    const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0)
    const totalSpending = budgetsWithSpending.reduce((sum, b) => sum + b.spending, 0)
    const totalRemaining = totalBudget - totalSpending

    return (
        <div className="budget-page">
            {/* Header */}
            <div className="budget-page__header">
                <div>
                    <h1 className="budget-page__title">
                        <Target size={24} />
                        Ngân sách
                    </h1>
                    <p className="budget-page__subtitle">
                        Quản lý ngân sách theo danh mục
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Thêm ngân sách
                </button>
            </div>

            {/* Summary Cards */}
            <div className="budget-page__summary">
                <div className="budget-card">
                    <div className="budget-card__label">Tổng ngân sách</div>
                    <div className="budget-card__value">{formatCurrency(totalBudget)}</div>
                </div>
                <div className="budget-card">
                    <div className="budget-card__label">Đã chi tiêu</div>
                    <div className="budget-card__value budget-card__value--spending">
                        {formatCurrency(totalSpending)}
                    </div>
                </div>
                <div className="budget-card">
                    <div className="budget-card__label">Còn lại</div>
                    <div className={`budget-card__value ${totalRemaining < 0 ? 'budget-card__value--over' : 'budget-card__value--remaining'}`}>
                        {formatCurrency(totalRemaining)}
                    </div>
                </div>
            </div>

            {/* Period Filter */}
            <div className="budget-page__filters">
                <div className="budget-page__period-filter">
                    <label className="budget-page__filter-label">Kỳ ngân sách:</label>
                    <select
                        className="form-select"
                        value={filterPeriod}
                        onChange={e => setFilterPeriod(e.target.value)}
                    >
                        {PERIOD_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Budget List */}
            {budgetsWithSpending.length > 0 ? (
                <div className="budget-page__list">
                    {budgetsWithSpending.map(budget => {
                        const category = getCategory(budget.categoryId)
                        if (!category) return null

                        return (
                            <div key={budget.id} className="budget-item">
                                <div className="budget-item__header">
                                    <div className="budget-item__category">
                                        <span className="budget-item__icon" style={{ background: category.color }}>
                                            {category.icon}
                                        </span>
                                        <div>
                                            <div className="budget-item__name">{category.name}</div>
                                            <div className="budget-item__amount">
                                                {formatCurrency(budget.spending)} / {formatCurrency(budget.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="budget-item__actions">
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => openEdit(budget)}
                                            title="Sửa"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => handleDelete(budget.id)}
                                            title="Xóa"
                                            style={{ color: 'var(--danger)' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="budget-item__progress">
                                    <div className="budget-item__progress-bar">
                                        <div
                                            className={`budget-item__progress-fill ${budget.isOverBudget ? 'budget-item__progress-fill--over' : ''}`}
                                            style={{
                                                width: `${Math.min(budget.percentage, 100)}%`,
                                                background: budget.isOverBudget ? 'var(--expense-color)' : category.color
                                            }}
                                        />
                                    </div>
                                    <div className="budget-item__progress-info">
                                        <span className="budget-item__percentage">
                                            {budget.percentage.toFixed(1)}%
                                        </span>
                                        {budget.isOverBudget ? (
                                            <span className="budget-item__status budget-item__status--over">
                                                <AlertCircle size={14} />
                                                Vượt {formatCurrency(Math.abs(budget.remaining))}
                                            </span>
                                        ) : (
                                            <span className="budget-item__status budget-item__status--ok">
                                                <CheckCircle2 size={14} />
                                                Còn {formatCurrency(budget.remaining)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="budget-page__empty">
                    <div className="empty-state">
                        <div className="empty-state__icon"><Target size={28} /></div>
                        <p className="empty-state__title">Chưa có ngân sách nào</p>
                        <p className="empty-state__desc">Nhấn nút "Thêm ngân sách" để bắt đầu quản lý ngân sách theo danh mục.</p>
                        <button className="btn btn-primary" onClick={openAdd}>
                            <Plus size={16} /> Thêm ngân sách
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditBudget(null) }}
                title={editBudget ? 'Sửa ngân sách' : 'Thêm ngân sách mới'}
            >
                <form onSubmit={handleSubmit} className="budget-form">
                    <div className="form-group">
                        <label className="form-label">Danh mục</label>
                        <select
                            className="form-select"
                            value={form.categoryId}
                            onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {expenseCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Số tiền (VNĐ)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={form.amount}
                            onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Kỳ ngân sách</label>
                        <select
                            className="form-select"
                            value={form.period}
                            onChange={e => setForm(prev => ({ ...prev, period: e.target.value }))}
                            required
                        >
                            {PERIOD_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="budget-form__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setShowModal(false); setEditBudget(null) }}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editBudget ? 'Cập nhật' : 'Thêm ngân sách'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

