import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Filter, Calendar, X, TrendingUp } from 'lucide-react'
import Modal from '../../components/Modal'
import TransactionForm from '../../components/TransactionForm'
import { formatCurrency, formatDate } from '../../utils/helpers'
import './Income.css'

const ITEMS_PER_PAGE = 10

export default function Income({ transactions, categories, addTransaction, updateTransaction, deleteTransaction }) {
    const [showModal, setShowModal] = useState(false)
    const [editTx, setEditTx] = useState(null)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [page, setPage] = useState(1)

    // Chỉ lấy transactions thu nhập
    const incomeTransactions = useMemo(() => 
        transactions.filter(tx => tx.type === 'income'),
        [transactions]
    )

    const getCat = (id) => categories.find(c => c.id === id)

    const filtered = useMemo(() => {
        return incomeTransactions.filter(tx => {
            if (filterCat !== 'all' && tx.category !== filterCat) return false
            if (search) {
                const cat = getCat(tx.category)
                const s = search.toLowerCase()
                const matchNote = tx.note?.toLowerCase().includes(s)
                const matchCat = cat?.name?.toLowerCase().includes(s)
                if (!matchNote && !matchCat) return false
            }
            // Filter by date range
            if (dateFrom || dateTo) {
                const txDate = new Date(tx.createdAt)
                txDate.setHours(0, 0, 0, 0)
                
                if (dateFrom) {
                    const fromDate = new Date(dateFrom)
                    fromDate.setHours(0, 0, 0, 0)
                    if (txDate < fromDate) return false
                }
                
                if (dateTo) {
                    const toDate = new Date(dateTo)
                    toDate.setHours(23, 59, 59, 999)
                    if (txDate > toDate) return false
                }
            }
            return true
        })
    }, [incomeTransactions, filterCat, search, dateFrom, dateTo, categories])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const totalAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0)

    const handleSubmit = (data) => {
        const incomeData = { ...data, type: 'income' }
        if (editTx) {
            updateTransaction(editTx.id, incomeData)
        } else {
            addTransaction(incomeData)
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

    const setDatePreset = (preset) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        switch (preset) {
            case 'today':
                const todayStr = today.toISOString().split('T')[0]
                setDateFrom(todayStr)
                setDateTo(todayStr)
                break
            case 'week':
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay())
                setDateFrom(weekStart.toISOString().split('T')[0])
                setDateTo(today.toISOString().split('T')[0])
                break
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                setDateFrom(monthStart.toISOString().split('T')[0])
                setDateTo(today.toISOString().split('T')[0])
                break
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1)
                setDateFrom(yearStart.toISOString().split('T')[0])
                setDateTo(today.toISOString().split('T')[0])
                break
            case 'clear':
                setDateFrom('')
                setDateTo('')
                break
            default:
                break
        }
        setPage(1)
    }

    const incomeCategories = categories.filter(c => c.type === 'income')

    return (
        <div className="income-page">
            {/* Header */}
            <div className="income-page__header">
                <div>
                    <h1 className="income-page__title">
                        <TrendingUp size={24} />
                        Thu nhập
                    </h1>
                    <p className="income-page__subtitle">
                        Tổng thu nhập: <span className="text-income">{formatCurrency(totalAmount)}</span>
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditTx(null); setShowModal(true) }}>
                    <Plus size={16} /> Thêm thu nhập
                </button>
            </div>

            {/* Toolbar */}
            <div className="income-page__toolbar">
                <div className="income-page__filters">
                    <div className="income-page__search">
                        <Search size={16} className="income-page__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="form-input income-page__search-input"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>

                    <select
                        className="form-select income-page__filter-select"
                        value={filterCat}
                        onChange={e => { setFilterCat(e.target.value); setPage(1) }}
                    >
                        <option value="all">Tất cả danh mục</option>
                        {incomeCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>

                    {/* Date Range Filter */}
                    <div className="income-page__date-filter">
                        <Calendar size={16} className="income-page__date-icon" />
                        <input
                            type="date"
                            className="form-input income-page__date-input"
                            value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                            placeholder="Từ ngày"
                        />
                        <span className="income-page__date-separator">→</span>
                        <input
                            type="date"
                            className="form-input income-page__date-input"
                            value={dateTo}
                            onChange={e => { setDateTo(e.target.value); setPage(1) }}
                            placeholder="Đến ngày"
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                className="btn-icon btn-ghost income-page__date-clear"
                                onClick={() => setDatePreset('clear')}
                                title="Xóa lọc ngày"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Quick Date Presets */}
                    <div className="income-page__date-presets">
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDatePreset('today')}
                        >
                            Hôm nay
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDatePreset('week')}
                        >
                            Tuần này
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDatePreset('month')}
                        >
                            Tháng này
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDatePreset('year')}
                        >
                            Năm này
                        </button>
                    </div>
                </div>
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
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="text-income" style={{ fontWeight: 600 }}>
                                                    +{formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="income-page__actions">
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
                        <div className="income-page__pagination">
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Trước
                            </button>
                            <span className="income-page__page-info">
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
                        <p className="empty-state__title">{search || filterCat !== 'all' || dateFrom || dateTo ? 'Không tìm thấy giao dịch' : 'Chưa có thu nhập nào'}</p>
                        <p className="empty-state__desc">{search || filterCat !== 'all' || dateFrom || dateTo ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Nhấn nút "Thêm thu nhập" để bắt đầu ghi nhận.'}</p>
                        {!search && filterCat === 'all' && !dateFrom && !dateTo && (
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={16} /> Thêm thu nhập
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditTx(null) }}
                title={editTx ? 'Sửa thu nhập' : 'Thêm thu nhập mới'}
            >
                <TransactionForm
                    categories={incomeCategories}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowModal(false); setEditTx(null) }}
                    hideTypeToggle={true}
                    initialData={editTx ? {
                        type: 'income',
                        amount: editTx.amount,
                        category: editTx.category,
                        note: editTx.note || '',
                        date: editTx.createdAt?.split('T')[0]
                    } : { type: 'income' }}
                />
            </Modal>
        </div>
    )
}

