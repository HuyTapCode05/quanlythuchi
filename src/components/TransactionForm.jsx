import { useState, useEffect } from 'react'

export default function TransactionForm({ categories, onSubmit, initialData, onCancel }) {
    const [form, setForm] = useState({
        type: 'expense',
        amount: '',
        category: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        ...initialData
    })

    useEffect(() => {
        if (initialData) {
            setForm(prev => ({ ...prev, ...initialData }))
        }
    }, [initialData])

    const filteredCats = categories.filter(c => c.type === form.type)

    const handleChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value }
            if (field === 'type') {
                updated.category = ''
            }
            return updated
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.amount || !form.category) return
        onSubmit(form)
        if (!initialData) {
            setForm({
                type: 'expense',
                amount: '',
                category: '',
                note: '',
                date: new Date().toISOString().split('T')[0],
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="tx-form">
            {/* Type toggle */}
            <div className="tx-form__type-toggle">
                <button
                    type="button"
                    className={`tx-form__type-btn ${form.type === 'expense' ? 'tx-form__type-btn--active tx-form__type-btn--expense' : ''}`}
                    onClick={() => handleChange('type', 'expense')}
                >
                    Chi tiêu
                </button>
                <button
                    type="button"
                    className={`tx-form__type-btn ${form.type === 'income' ? 'tx-form__type-btn--active tx-form__type-btn--income' : ''}`}
                    onClick={() => handleChange('type', 'income')}
                >
                    Thu nhập
                </button>
            </div>

            {/* Amount */}
            <div className="form-group">
                <label className="form-label">Số tiền (VNĐ)</label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={form.amount}
                    onChange={e => handleChange('amount', e.target.value)}
                    required
                    min="1"
                />
            </div>

            {/* Category */}
            <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                    className="form-select"
                    value={form.category}
                    onChange={e => handleChange('category', e.target.value)}
                    required
                >
                    <option value="">-- Chọn danh mục --</option>
                    {filteredCats.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date */}
            <div className="form-group">
                <label className="form-label">Ngày</label>
                <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={e => handleChange('date', e.target.value)}
                />
            </div>

            {/* Note */}
            <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Ghi chú (tùy chọn)"
                    value={form.note}
                    onChange={e => handleChange('note', e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className="tx-form__actions">
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Hủy
                    </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {initialData ? 'Cập nhật' : 'Thêm giao dịch'}
                </button>
            </div>

            <style>{`
        .tx-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .tx-form__type-toggle {
          display: flex;
          gap: var(--space-sm);
          padding: 4px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .tx-form__type-btn {
          flex: 1;
          padding: var(--space-md);
          border-radius: var(--radius-sm);
          font-size: var(--fs-sm);
          font-weight: var(--fw-semibold);
          text-align: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .tx-form__type-btn:hover {
          color: var(--text-primary);
        }
        .tx-form__type-btn--active {
          color: white;
        }
        .tx-form__type-btn--expense {
          background: var(--expense-color);
        }
        .tx-form__type-btn--income {
          background: var(--income-color);
        }
        .tx-form__actions {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-sm);
        }
      `}</style>
        </form>
    )
}
