import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Repeat, Calendar, Power, PowerOff, Mail } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import './Recurring.css'

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'yearly', label: 'Hàng năm' }
]

export default function Recurring({ recurring, categories, addRecurring, updateRecurring, deleteRecurring, toggleActive }) {
    const [showModal, setShowModal] = useState(false)
    const [editRecurring, setEditRecurring] = useState(null)
    const [sendingEmail, setSendingEmail] = useState(false)
    const { user } = useAuth()
    const [form, setForm] = useState({
        type: 'expense',
        amount: '',
        categoryId: '',
        note: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        nextDate: new Date().toISOString().split('T')[0]
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffInDays = (dateStr) => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        d.setHours(0, 0, 0, 0)
        const diffMs = d.getTime() - today.getTime()
        return Math.round(diffMs / (1000 * 60 * 60 * 24))
    }

    const activeRecurring = recurring
        .filter(r => r.isActive === 1)
        .map(r => {
            const next = r.nextDate || r.next_date
            const days = diffInDays(next)
            return { ...r, _daysUntilNext: days }
        })

    const inactiveRecurring = recurring.filter(r => r.isActive === 0)

    const getCategory = (id) => categories.find(c => c.id === id)
    const getFrequencyLabel = (freq) => FREQUENCY_OPTIONS.find(f => f.value === freq)?.label || freq

    const openAdd = (type = 'expense') => {
        setEditRecurring(null)
        setForm({
            type,
            amount: '',
            categoryId: '',
            note: '',
            frequency: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            nextDate: new Date().toISOString().split('T')[0]
        })
        setShowModal(true)
    }

    const openEdit = (item) => {
        setEditRecurring(item)
        setForm({
            type: item.type,
            amount: item.amount,
            categoryId: item.categoryId || item.category_id || '',
            note: item.note || '',
            frequency: item.frequency,
            startDate: item.startDate || item.start_date || '',
            endDate: item.endDate || item.end_date || '',
            nextDate: item.nextDate || item.next_date || ''
        })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.amount || !form.categoryId || !form.startDate || !form.nextDate) return

        if (editRecurring) {
            updateRecurring(editRecurring.id, form)
        } else {
            addRecurring(form)
        }
        setShowModal(false)
        setEditRecurring(null)
    }

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa giao dịch định kỳ này?')) {
            deleteRecurring(id)
        }
    }

    const handleToggleActive = (id, currentActive) => {
        toggleActive(id, !currentActive)
    }

    const handleSendEmailReminders = async () => {
        if (!user?.id) {
            alert('Bạn cần đăng nhập để gửi email nhắc nhở.')
            return
        }
        try {
            setSendingEmail(true)
            const result = await api.sendRecurringReminders(user.id)
            if (result.sent) {
                alert(`Đã gửi email nhắc ${result.count} giao dịch định kỳ tới ${result.email || 'email của bạn'}.`)
            } else {
                alert(result.message || 'Không có giao dịch định kỳ sắp đến hạn trong 3 ngày tới.')
            }
        } catch (error) {
            console.error('Send reminders error:', error)
            alert(error.message || 'Lỗi khi gửi email nhắc giao dịch định kỳ.')
        } finally {
            setSendingEmail(false)
        }
    }

    const filteredCategories = useMemo(() => 
        categories.filter(c => c.type === form.type),
        [categories, form.type]
    )

    return (
        <div className="recurring-page">
            {/* Header */}
            <div className="recurring-page__header">
                <div>
                    <h1 className="recurring-page__title">
                        <Repeat size={24} />
                        Giao dịch định kỳ
                    </h1>
                    <p className="recurring-page__subtitle">
                        Tự động tạo giao dịch lặp lại theo chu kỳ
                    </p>
                </div>
                <div className="recurring-page__actions">
                    <button className="btn btn-secondary" onClick={() => openAdd('expense')}>
                        <Plus size={16} /> Chi tiêu định kỳ
                    </button>
                    <button className="btn btn-primary" onClick={() => openAdd('income')}>
                        <Plus size={16} /> Thu nhập định kỳ
                    </button>
                    <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={handleSendEmailReminders}
                        disabled={sendingEmail}
                        title="Gửi email nhắc các giao dịch định kỳ sắp đến hạn"
                    >
                        <Mail size={16} />
                        {sendingEmail ? 'Đang gửi...' : 'Gửi mail nhắc định kỳ'}
                    </button>
                </div>
            </div>

            {/* Active Recurring */}
            {activeRecurring.length > 0 && (
                <div className="recurring-page__section">
                    <h2 className="recurring-page__section-title">Đang hoạt động</h2>
                    <div className="recurring-page__list">
                        {activeRecurring.map(item => {
                            const category = getCategory(item.categoryId || item.category_id)
                            const days = item._daysUntilNext ?? null
                            const isDueSoon = days !== null && days >= 0 && days <= 3
                            const isOverdue = days !== null && days < 0
                            return (
                                <div
                                    key={item.id}
                                    className={`recurring-item recurring-item--active ${isDueSoon ? 'recurring-item--due-soon' : ''} ${isOverdue ? 'recurring-item--overdue' : ''}`}
                                >
                                    <div className="recurring-item__main">
                                        <div className="recurring-item__category">
                                            <span 
                                                className="recurring-item__icon" 
                                                style={{ background: category?.color || '#9d9dba' }}
                                            >
                                                {category?.icon || '📌'}
                                            </span>
                                            <div>
                                                <div className="recurring-item__name">
                                                    {category?.name || 'Không rõ'}
                                                </div>
                                                <div className="recurring-item__details">
                                                    <span className={`badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                                                        {item.type === 'income' ? 'Thu' : 'Chi'}
                                                    </span>
                                                    <span className="recurring-item__frequency">
                                                        {getFrequencyLabel(item.frequency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recurring-item__amount">
                                            <span className={item.type === 'income' ? 'text-income' : 'text-expense'}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="recurring-item__info">
                                        <div className="recurring-item__dates">
                                            <span>
                                                <Calendar size={14} />
                                                Bắt đầu: {formatDate(item.startDate || item.start_date)}
                                            </span>
                                            {item.endDate || item.end_date ? (
                                                <span>
                                                    Kết thúc: {formatDate(item.endDate || item.end_date)}
                                                </span>
                                            ) : (
                                                <span className="text-secondary">Không giới hạn</span>
                                            )}
                                            <span className="recurring-item__next">
                                                Lần tới: {formatDate(item.nextDate || item.next_date)}
                                            </span>
                                            {isDueSoon && !isOverdue && (
                                                <span className="recurring-item__chip recurring-item__chip--soon">
                                                    Sắp đến hạn
                                                </span>
                                            )}
                                            {isOverdue && (
                                                <span className="recurring-item__chip recurring-item__chip--overdue">
                                                    Đã quá hạn
                                                </span>
                                            )}
                                        </div>
                                        {item.note && (
                                            <div className="recurring-item__note">{item.note}</div>
                                        )}
                                    </div>
                                    <div className="recurring-item__actions">
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => handleToggleActive(item.id, item.isActive === 1)}
                                            title="Tắt"
                                        >
                                            <PowerOff size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => openEdit(item)}
                                            title="Sửa"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => handleDelete(item.id)}
                                            title="Xóa"
                                            style={{ color: 'var(--danger)' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Inactive Recurring */}
            {inactiveRecurring.length > 0 && (
                <div className="recurring-page__section">
                    <h2 className="recurring-page__section-title">Đã tắt</h2>
                    <div className="recurring-page__list">
                        {inactiveRecurring.map(item => {
                            const category = getCategory(item.categoryId || item.category_id)
                            return (
                                <div key={item.id} className="recurring-item recurring-item--inactive">
                                    <div className="recurring-item__main">
                                        <div className="recurring-item__category">
                                            <span 
                                                className="recurring-item__icon" 
                                                style={{ background: category?.color || '#9d9dba', opacity: 0.5 }}
                                            >
                                                {category?.icon || '📌'}
                                            </span>
                                            <div>
                                                <div className="recurring-item__name">
                                                    {category?.name || 'Không rõ'}
                                                </div>
                                                <div className="recurring-item__details">
                                                    <span className={`badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                                                        {item.type === 'income' ? 'Thu' : 'Chi'}
                                                    </span>
                                                    <span className="recurring-item__frequency">
                                                        {getFrequencyLabel(item.frequency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recurring-item__amount">
                                            <span className={item.type === 'income' ? 'text-income' : 'text-expense'}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="recurring-item__actions">
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => handleToggleActive(item.id, item.isActive === 1)}
                                            title="Bật"
                                        >
                                            <Power size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => openEdit(item)}
                                            title="Sửa"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn-icon btn-ghost"
                                            onClick={() => handleDelete(item.id)}
                                            title="Xóa"
                                            style={{ color: 'var(--danger)' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {recurring.length === 0 && (
                <div className="recurring-page__empty">
                    <div className="empty-state">
                        <div className="empty-state__icon"><Repeat size={28} /></div>
                        <p className="empty-state__title">Chưa có giao dịch định kỳ nào</p>
                        <p className="empty-state__desc">Tạo giao dịch định kỳ để tự động ghi nhận thu chi lặp lại (lương, hóa đơn, v.v.)</p>
                        <div className="empty-state__actions">
                            <button className="btn btn-secondary" onClick={() => openAdd('expense')}>
                                <Plus size={16} /> Chi tiêu định kỳ
                            </button>
                            <button className="btn btn-primary" onClick={() => openAdd('income')}>
                                <Plus size={16} /> Thu nhập định kỳ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditRecurring(null) }}
                title={editRecurring ? 'Sửa giao dịch định kỳ' : 'Thêm giao dịch định kỳ mới'}
            >
                <form onSubmit={handleSubmit} className="recurring-form">
                    <div className="form-group">
                        <label className="form-label">Loại</label>
                        <div className="recurring-form__type-toggle">
                            <button
                                type="button"
                                className={`recurring-form__type-btn ${form.type === 'expense' ? 'recurring-form__type-btn--active recurring-form__type-btn--expense' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, type: 'expense', categoryId: '' }))}
                            >
                                Chi tiêu
                            </button>
                            <button
                                type="button"
                                className={`recurring-form__type-btn ${form.type === 'income' ? 'recurring-form__type-btn--active recurring-form__type-btn--income' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, type: 'income', categoryId: '' }))}
                            >
                                Thu nhập
                            </button>
                        </div>
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
                        <label className="form-label">Danh mục</label>
                        <select
                            className="form-select"
                            value={form.categoryId}
                            onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tần suất</label>
                        <select
                            className="form-select"
                            value={form.frequency}
                            onChange={e => setForm(prev => ({ ...prev, frequency: e.target.value }))}
                            required
                        >
                            {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ngày bắt đầu</label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.startDate}
                            onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value, nextDate: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ngày kết thúc (tùy chọn)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.endDate}
                            onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                        <small className="form-hint">Để trống nếu không giới hạn</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Lần tạo tiếp theo</label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.nextDate}
                            onChange={e => setForm(prev => ({ ...prev, nextDate: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ghi chú</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ghi chú (tùy chọn)"
                            value={form.note}
                            onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                        />
                    </div>

                    <div className="recurring-form__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setShowModal(false); setEditRecurring(null) }}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editRecurring ? 'Cập nhật' : 'Thêm giao dịch'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

