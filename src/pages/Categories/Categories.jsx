import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import Modal from '../../components/Modal'
import './Categories.css'

const COLOR_OPTIONS = [
    '#ff6b6b', '#ff6348', '#ffa502', '#2ed573', '#00b894',
    '#00cec9', '#1e90ff', '#6c5ce7', '#a55eea', '#fd79a8',
    '#e056fd', '#9d9dba'
]

const ICON_OPTIONS = [
    '🍔', '🚗', '🛒', '🎮', '📄', '💊', '📚', '📌',
    '💰', '🎁', '📈', '💻', '💵', '🏠', '✈️', '🎬',
    '🍺', '👕', '💄', '🐕', '⚽', '🎵', '📱', '🔧'
]

export default function Categories({ categories, addCategory, updateCategory, deleteCategory }) {
    const [showModal, setShowModal] = useState(false)
    const [editCat, setEditCat] = useState(null)
    const [form, setForm] = useState({ name: '', color: COLOR_OPTIONS[0], icon: ICON_OPTIONS[0], type: 'expense' })

    const expenseCats = categories.filter(c => c.type === 'expense')
    const incomeCats = categories.filter(c => c.type === 'income')

    const openAdd = (type) => {
        setEditCat(null)
        setForm({ name: '', color: COLOR_OPTIONS[0], icon: ICON_OPTIONS[0], type })
        setShowModal(true)
    }

    const openEdit = (cat) => {
        setEditCat(cat)
        setForm({ name: cat.name, color: cat.color, icon: cat.icon, type: cat.type })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name.trim()) return
        if (editCat) {
            updateCategory(editCat.id, form)
        } else {
            addCategory(form)
        }
        setShowModal(false)
        setEditCat(null)
    }

    const handleDelete = (id) => {
        if (confirm('Xóa danh mục này?')) deleteCategory(id)
    }

    const renderGroup = (title, cats, type) => (
        <div className="cat-group">
            <div className="cat-group__header">
                <h3 className="cat-group__title">{title}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => openAdd(type)}>
                    <Plus size={14} /> Thêm
                </button>
            </div>
            {cats.length > 0 ? (
                <div className="cat-grid">
                    {cats.map(cat => (
                        <div key={cat.id} className="cat-card" style={{ '--cat-color': cat.color }}>
                            <div className="cat-card__icon">{cat.icon}</div>
                            <div className="cat-card__info">
                                <p className="cat-card__name">{cat.name}</p>
                                <span className="cat-card__dot" style={{ background: cat.color }}></span>
                            </div>
                            <div className="cat-card__actions">
                                <button className="btn-icon btn-ghost" onClick={() => openEdit(cat)} title="Sửa">
                                    <Pencil size={14} />
                                </button>
                                <button className="btn-icon btn-ghost" onClick={() => handleDelete(cat.id)} title="Xóa" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                    <p className="text-muted">Chưa có danh mục nào</p>
                </div>
            )}
        </div>
    )

    return (
        <div className="categories">
            {renderGroup('Danh mục chi tiêu', expenseCats, 'expense')}
            {renderGroup('Danh mục thu nhập', incomeCats, 'income')}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditCat(null) }}
                title={editCat ? 'Sửa danh mục' : 'Thêm danh mục'}
            >
                <form onSubmit={handleSubmit} className="cat-form">
                    <div className="form-group">
                        <label className="form-label">Tên danh mục</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="VD: Ăn uống"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Icon</label>
                        <div className="cat-form__icons">
                            {ICON_OPTIONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`cat-form__icon-btn ${form.icon === icon ? 'cat-form__icon-btn--active' : ''}`}
                                    onClick={() => setForm(prev => ({ ...prev, icon }))}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Màu sắc</label>
                        <div className="cat-form__colors">
                            {COLOR_OPTIONS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`cat-form__color-btn ${form.color === color ? 'cat-form__color-btn--active' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => setForm(prev => ({ ...prev, color }))}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditCat(null) }}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editCat ? 'Cập nhật' : 'Tạo danh mục'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
