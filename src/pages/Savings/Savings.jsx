import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatCurrency, formatDate } from '../../utils/helpers'
import './Savings.css'

export default function Savings({ goals, addGoal, updateGoal, deleteGoal, addToGoal }) {
    const [showModal, setShowModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editGoal, setEditGoal] = useState(null)
    const [form, setForm] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: ''
    })
    const [addAmount, setAddAmount] = useState('')

    const activeGoals = goals.filter(g => (g.isCompleted === 0 || g.isCompleted === false))
    const completedGoals = goals.filter(g => (g.isCompleted === 1 || g.isCompleted === true))

    const calculateProgress = (goal) => {
        const current = goal.currentAmount || goal.current_amount || 0
        const target = goal.targetAmount || goal.target_amount || 1
        return Math.min((current / target) * 100, 100)
    }

    const getDaysRemaining = (targetDate) => {
        if (!targetDate) return null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const target = new Date(targetDate)
        target.setHours(0, 0, 0, 0)
        const diff = target - today
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return days
    }

    const openAdd = () => {
        setEditGoal(null)
        setForm({
            name: '',
            targetAmount: '',
            currentAmount: '',
            targetDate: ''
        })
        setShowModal(true)
    }

    const openEdit = (goal) => {
        setEditGoal(goal)
        setForm({
            name: goal.name,
            targetAmount: goal.targetAmount || goal.target_amount || '',
            currentAmount: goal.currentAmount || goal.current_amount || '',
            targetDate: goal.targetDate || goal.target_date || ''
        })
        setShowModal(true)
    }

    const openAddAmount = (goal) => {
        setEditGoal(goal)
        setAddAmount('')
        setShowAddModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name || !form.targetAmount) return

        if (editGoal) {
            updateGoal(editGoal.id, form)
        } else {
            addGoal(form)
        }
        setShowModal(false)
        setEditGoal(null)
    }

    const handleAddAmount = (e) => {
        e.preventDefault()
        if (!addAmount || !editGoal) return

        addToGoal(editGoal.id, addAmount)
        setShowAddModal(false)
        setAddAmount('')
        setEditGoal(null)
    }

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
            deleteGoal(id)
        }
    }

    const handleComplete = (goal) => {
        if (confirm('Đánh dấu mục tiêu này là đã hoàn thành?')) {
            updateGoal(goal.id, { ...goal, isCompleted: 1 })
        }
    }

    const totalTarget = activeGoals.reduce((sum, g) => sum + (g.targetAmount || g.target_amount || 0), 0)
    const totalCurrent = activeGoals.reduce((sum, g) => sum + (g.currentAmount || g.current_amount || 0), 0)
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

    return (
        <div className="savings-page">
            {/* Header */}
            <div className="savings-page__header">
                <div>
                    <h1 className="savings-page__title">
                        <Target size={24} />
                        Mục tiêu tiết kiệm
                    </h1>
                    <p className="savings-page__subtitle">
                        Theo dõi và đạt được các mục tiêu tài chính của bạn
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Thêm mục tiêu
                </button>
            </div>

            {/* Summary */}
            <div className="savings-page__summary">
                <div className="savings-summary-card">
                    <div className="savings-summary-card__label">Tổng mục tiêu</div>
                    <div className="savings-summary-card__value">{formatCurrency(totalTarget)}</div>
                </div>
                <div className="savings-summary-card">
                    <div className="savings-summary-card__label">Đã tiết kiệm</div>
                    <div className="savings-summary-card__value savings-summary-card__value--current">
                        {formatCurrency(totalCurrent)}
                    </div>
                </div>
                <div className="savings-summary-card">
                    <div className="savings-summary-card__label">Tiến độ tổng thể</div>
                    <div className="savings-summary-card__value">
                        {overallProgress.toFixed(1)}%
                    </div>
                    <div className="savings-summary-card__progress">
                        <div 
                            className="savings-summary-card__progress-bar"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <div className="savings-page__section">
                    <h2 className="savings-page__section-title">Đang thực hiện</h2>
                    <div className="savings-page__list">
                        {activeGoals.map(goal => {
                            const progress = calculateProgress(goal)
                            const current = goal.currentAmount || goal.current_amount || 0
                            const target = goal.targetAmount || goal.target_amount || 0
                            const remaining = target - current
                            const daysRemaining = getDaysRemaining(goal.targetDate || goal.target_date)

                            return (
                                <div key={goal.id} className="savings-goal">
                                    <div className="savings-goal__header">
                                        <div className="savings-goal__info">
                                            <h3 className="savings-goal__name">{goal.name}</h3>
                                            <div className="savings-goal__amounts">
                                                <span className="savings-goal__current">
                                                    {formatCurrency(current)}
                                                </span>
                                                <span className="savings-goal__separator">/</span>
                                                <span className="savings-goal__target">
                                                    {formatCurrency(target)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="savings-goal__actions">
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => openAddAmount(goal)}
                                            >
                                                <TrendingUp size={14} /> Thêm tiền
                                            </button>
                                            <button
                                                className="btn-icon btn-ghost"
                                                onClick={() => openEdit(goal)}
                                                title="Sửa"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                className="btn-icon btn-ghost"
                                                onClick={() => handleComplete(goal)}
                                                title="Hoàn thành"
                                            >
                                                <CheckCircle2 size={15} />
                                            </button>
                                            <button
                                                className="btn-icon btn-ghost"
                                                onClick={() => handleDelete(goal.id)}
                                                title="Xóa"
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="savings-goal__progress">
                                        <div className="savings-goal__progress-bar">
                                            <div
                                                className="savings-goal__progress-fill"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="savings-goal__progress-info">
                                            <span className="savings-goal__percentage">
                                                {progress.toFixed(1)}%
                                            </span>
                                            <span className="savings-goal__remaining">
                                                Còn lại: {formatCurrency(remaining)}
                                            </span>
                                        </div>
                                    </div>

                                    {(goal.targetDate || goal.target_date) && (
                                        <div className="savings-goal__date">
                                            <Calendar size={14} />
                                            <span>
                                                Mục tiêu: {formatDate(goal.targetDate || goal.target_date)}
                                                {daysRemaining !== null && (
                                                    <span className={daysRemaining < 0 ? 'text-expense' : 'text-secondary'}>
                                                        {' '}({daysRemaining >= 0 ? `${daysRemaining} ngày còn lại` : `Đã quá ${Math.abs(daysRemaining)} ngày`})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className="savings-page__section">
                    <h2 className="savings-page__section-title">Đã hoàn thành</h2>
                    <div className="savings-page__list">
                        {completedGoals.map(goal => {
                            const current = goal.currentAmount || goal.current_amount || 0
                            const target = goal.targetAmount || goal.target_amount || 0

                            return (
                                <div key={goal.id} className="savings-goal savings-goal--completed">
                                    <div className="savings-goal__header">
                                        <div className="savings-goal__info">
                                            <h3 className="savings-goal__name">
                                                {goal.name} <CheckCircle2 size={16} className="text-income" />
                                            </h3>
                                            <div className="savings-goal__amounts">
                                                <span className="savings-goal__current">
                                                    {formatCurrency(current)}
                                                </span>
                                                <span className="savings-goal__separator">/</span>
                                                <span className="savings-goal__target">
                                                    {formatCurrency(target)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="savings-goal__actions">
                                            <button
                                                className="btn-icon btn-ghost"
                                                onClick={() => handleDelete(goal.id)}
                                                title="Xóa"
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {goals.length === 0 && (
                <div className="savings-page__empty">
                    <div className="empty-state">
                        <div className="empty-state__icon"><Target size={28} /></div>
                        <p className="empty-state__title">Chưa có mục tiêu tiết kiệm nào</p>
                        <p className="empty-state__desc">Tạo mục tiêu tiết kiệm để theo dõi và đạt được các mục tiêu tài chính của bạn.</p>
                        <button className="btn btn-primary" onClick={openAdd}>
                            <Plus size={16} /> Thêm mục tiêu
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditGoal(null) }}
                title={editGoal ? 'Sửa mục tiêu tiết kiệm' : 'Thêm mục tiêu tiết kiệm mới'}
            >
                <form onSubmit={handleSubmit} className="savings-form">
                    <div className="form-group">
                        <label className="form-label">Tên mục tiêu</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ví dụ: Mua xe máy, Du lịch..."
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Số tiền mục tiêu (VNĐ)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={form.targetAmount}
                            onChange={e => setForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Số tiền hiện tại (VNĐ)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={form.currentAmount}
                            onChange={e => setForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                            min="0"
                        />
                        <small className="form-hint">Số tiền đã tiết kiệm được</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ngày mục tiêu (tùy chọn)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.targetDate}
                            onChange={e => setForm(prev => ({ ...prev, targetDate: e.target.value }))}
                        />
                        <small className="form-hint">Ngày muốn đạt được mục tiêu</small>
                    </div>

                    <div className="savings-form__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setShowModal(false); setEditGoal(null) }}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editGoal ? 'Cập nhật' : 'Thêm mục tiêu'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Amount Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setEditGoal(null); setAddAmount('') }}
                title={`Thêm tiền vào "${editGoal?.name || ''}"`}
            >
                <form onSubmit={handleAddAmount} className="savings-form">
                    <div className="form-group">
                        <label className="form-label">Số tiền thêm vào (VNĐ)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={addAmount}
                            onChange={e => setAddAmount(e.target.value)}
                            required
                            min="1"
                        />
                    </div>

                    {editGoal && (
                        <div className="savings-form__preview">
                            <div className="savings-form__preview-item">
                                <span>Hiện tại:</span>
                                <span>{formatCurrency(editGoal.currentAmount || editGoal.current_amount || 0)}</span>
                            </div>
                            <div className="savings-form__preview-item">
                                <span>Thêm vào:</span>
                                <span className="text-income">+{formatCurrency(addAmount || 0)}</span>
                            </div>
                            <div className="savings-form__preview-item savings-form__preview-item--total">
                                <span>Tổng sau:</span>
                                <span className="text-income">
                                    {formatCurrency((editGoal.currentAmount || editGoal.current_amount || 0) + Number(addAmount || 0))}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="savings-form__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setShowAddModal(false); setEditGoal(null); setAddAmount('') }}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Thêm tiền
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

