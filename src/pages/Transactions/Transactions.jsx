import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react'
import Modal from '../../components/Modal'
import TransactionForm from '../../components/TransactionForm'
import { formatCurrency, formatDate } from '../../utils/helpers'
import './Transactions.css'

const ITEMS_PER_PAGE = 10

export default function Transactions({ transactions, categories, addTransaction, updateTransaction, deleteTransaction }) {
    const [showModal, setShowModal] = useState(false)
    const [editTx, setEditTx] = useState(null)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterCat, setFilterCat] = useState('all')
    const [page, setPage] = useState(1)

    const getCat = (id) => categories.find(c => c.id === id)

    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            if (filterType !== 'all' && tx.type !== filterType) return false
            if (filterCat !== 'all' && tx.category !== filterCat) return false
            if (search) {
                const cat = getCat(tx.category)
                const s = search.toLowerCase()
                const matchNote = tx.note?.toLowerCase().includes(s)
                const matchCat = cat?.name?.toLowerCase().includes(s)
                if (!matchNote && !matchCat) return false
            }
            return true
        })
    }, [transactions, filterType, filterCat, search, categories])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const handleSubmit = (data) => {
        if (editTx) {
            updateTransaction(editTx.id, data)
        } else {
            addTransaction(data)
        }
        setShowModal(false)
        setEditTx(null)
    }

    const handleEdit = (tx) => {
        setEditTx(tx)
        setShowModal(true)
    }

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
            deleteTransaction(id)
        }
    }

    return (
        <div className="transactions">
            {/* Toolbar */}
            <div className="transactions__toolbar">
                <div className="transactions__filters">
                    <div className="transactions__search">
                        <Search size={16} className="transactions__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giao dịch..."
                            className="form-input transactions__search-input"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>

                    <select
                        className="form-select transactions__filter-select"
                        value={filterType}
                        onChange={e => { setFilterType(e.target.value); setPage(1) }}
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="income">Thu nhập</option>
                        <option value="expense">Chi tiêu</option>
                    </select>

                    <select
                        className="form-select transactions__filter-select"
                        value={filterCat}
                        onChange={e => { setFilterCat(e.target.value); setPage(1) }}
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>

                <button className="btn btn-primary" onClick={() => { setEditTx(null); setShowModal(true) }}>
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            {/* Table */}
            {paginated.length > 0 ? (
                <>
                    <div className="table-container animate-fade-in-up">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Danh mục</th>
                                    <th>Ghi chú</th>
                                    <th>Ngày</th>
                                    <th>Loại</th>
                                    <th style={{ textAlign: 'right' }}>Số tiền</th>
                                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(tx => {
                                    const cat = getCat(tx.category)
                                    return (
                                        <tr key={tx.id}>
                                            <td>
                                                <div className="category-tag">
                                                    <span className="category-tag__dot" style={{ background: cat?.color || '#9d9dba' }}></span>
                                                    {cat ? `${cat.icon} ${cat.name}` : 'Không rõ'}
                                                </div>
                                            </td>
                                            <td className="text-secondary">{tx.note || '—'}</td>
                                            <td className="text-secondary">{formatDate(tx.createdAt)}</td>
                                            <td>
                                                <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                                                    {tx.type === 'income' ? 'Thu' : 'Chi'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className={tx.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 600 }}>
                                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="transactions__actions">
                                                    <button className="btn-icon btn-ghost" onClick={() => handleEdit(tx)} title="Sửa">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button className="btn-icon btn-ghost" onClick={() => handleDelete(tx.id)} title="Xóa" style={{ color: 'var(--danger)' }}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="transactions__pagination">
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Trước
                            </button>
                            <span className="transactions__page-info">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="table-container">
                    <div className="empty-state">
                        <div className="empty-state__icon"><Filter size={28} /></div>
                        <p className="empty-state__title">{search || filterType !== 'all' || filterCat !== 'all' ? 'Không tìm thấy giao dịch' : 'Chưa có giao dịch nào'}</p>
                        <p className="empty-state__desc">{search || filterType !== 'all' || filterCat !== 'all' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Nhấn nút "Thêm mới" để bắt đầu ghi nhận.'}</p>
                        {!search && filterType === 'all' && filterCat === 'all' && (
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={16} /> Thêm giao dịch
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditTx(null) }}
                title={editTx ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
            >
                <TransactionForm
                    categories={categories}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowModal(false); setEditTx(null) }}
                    initialData={editTx ? {
                        type: editTx.type,
                        amount: editTx.amount,
                        category: editTx.category,
                        note: editTx.note || '',
                        date: editTx.createdAt?.split('T')[0]
                    } : null}
                />
            </Modal>
        </div>
    )
}
