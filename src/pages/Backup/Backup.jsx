import { useMemo, useRef, useState } from 'react'
import { Download, Upload, AlertTriangle, Database } from 'lucide-react'
import { importFromDB } from '../../utils/dbExport'
import './Backup.css'

export default function Backup({ onExportData, onRestoreData }) {
    const fileInputRef = useRef(null)
    const [selectedFileName, setSelectedFileName] = useState('')
    const [preview, setPreview] = useState(null) // { categoriesCount, transactionsCount, arrayBuffer }
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [error, setError] = useState('')

    const canRestore = useMemo(() => {
        return !!preview?.arrayBuffer && confirmText.trim().toUpperCase() === 'RESTORE'
    }, [preview, confirmText])

    const handlePickFile = () => {
        setError('')
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setError('')
        setSelectedFileName(file.name)
        setConfirmText('')
        setPreview(null)
        setLoadingPreview(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const { categories, transactions } = await importFromDB(arrayBuffer)
            setPreview({
                categoriesCount: categories.length,
                transactionsCount: transactions.length,
                arrayBuffer
            })
        } catch (err) {
            console.error('Backup restore preview error:', err)
            setError('File không hợp lệ. Vui lòng chọn đúng file .db đã export từ FinTrack.')
        } finally {
            setLoadingPreview(false)
            e.target.value = ''
        }
    }

    const handleRestore = async () => {
        if (!canRestore) return
        setError('')
        try {
            const ok = confirm('Bạn chắc chắn muốn RESTORE? Tất cả dữ liệu hiện tại sẽ bị ghi đè.')
            if (!ok) return
            await onRestoreData(preview.arrayBuffer)
            alert('Restore thành công!')
            setSelectedFileName('')
            setPreview(null)
            setConfirmText('')
        } catch (err) {
            console.error('Restore error:', err)
            setError(err?.message || 'Restore thất bại. Vui lòng thử lại.')
        }
    }

    return (
        <div className="backup-page">
            <div className="backup-page__header">
                <div className="backup-page__title">
                    <Database size={22} />
                    <div>
                        <div className="backup-page__heading">Backup / Restore</div>
                        <div className="backup-page__subheading">Tải file database (.db) và khôi phục lại khi cần</div>
                    </div>
                </div>
            </div>

            <div className="backup-page__grid">
                <section className="backup-card">
                    <div className="backup-card__top">
                        <div className="backup-card__name">Backup (Xuất dữ liệu)</div>
                        <div className="backup-card__desc">Tải file `.db` về máy để lưu trữ.</div>
                    </div>
                    <button className="btn btn-primary backup-card__btn" onClick={onExportData}>
                        <Download size={16} /> Tải file .db
                    </button>
                </section>

                <section className="backup-card backup-card--danger">
                    <div className="backup-card__top">
                        <div className="backup-card__name">Restore (Khôi phục)</div>
                        <div className="backup-card__desc">
                            <span className="backup-warn">
                                <AlertTriangle size={14} /> Restore sẽ <strong>ghi đè</strong> dữ liệu hiện tại.
                            </span>
                        </div>
                    </div>

                    <div className="backup-restore">
                        <div className="backup-restore__row">
                            <button className="btn btn-secondary" onClick={handlePickFile}>
                                <Upload size={16} /> Chọn file .db
                            </button>
                            <div className="backup-restore__file">
                                {selectedFileName ? selectedFileName : 'Chưa chọn file'}
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".db,application/x-sqlite3"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {loadingPreview && (
                            <div className="backup-restore__hint">Đang đọc file để preview…</div>
                        )}

                        {preview && (
                            <div className="backup-restore__preview">
                                <div className="backup-restore__kpi">
                                    <div className="backup-restore__kpi-label">Categories</div>
                                    <div className="backup-restore__kpi-value">{preview.categoriesCount}</div>
                                </div>
                                <div className="backup-restore__kpi">
                                    <div className="backup-restore__kpi-label">Transactions</div>
                                    <div className="backup-restore__kpi-value">{preview.transactionsCount}</div>
                                </div>
                            </div>
                        )}

                        <div className="backup-restore__confirm">
                            <div className="backup-restore__confirm-label">
                                Gõ <strong>RESTORE</strong> để xác nhận:
                            </div>
                            <input
                                className="form-input backup-restore__confirm-input"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="RESTORE"
                            />
                        </div>

                        {error && <div className="backup-restore__error">{error}</div>}

                        <button
                            className="btn btn-danger backup-card__btn"
                            disabled={!canRestore}
                            onClick={handleRestore}
                        >
                            Restore và ghi đè dữ liệu
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}


