import { useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'
import './Layout.css'

const pageTitles = {
    '/': 'Tổng quan',
    '/transactions': 'Giao dịch',
    '/categories': 'Danh mục',
}

export default function Layout({ onExportData, onImportData }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const location = useLocation()

    const title = pageTitles[location.pathname] || 'FinTrack'

    const handleLogout = () => {
        if (confirm('Đăng xuất khỏi tài khoản hiện tại?')) {
            logout()
            navigate('/login', { replace: true })
        }
    }

    const handleClickImport = () => {
        if (!onImportData) return
        fileInputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file || !onImportData) return
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result
                const json = JSON.parse(text)
                onImportData(json)
                alert('Đã import dữ liệu từ file JSON.')
            } catch {
                alert('File không hợp lệ, vui lòng chọn đúng file JSON từ FinTrack.')
            } finally {
                e.target.value = ''
            }
        }
        reader.readAsText(file, 'utf-8')
    }

    return (
        <div className={`layout ${collapsed ? 'layout--collapsed' : ''}`}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />

            <div className="layout__main">
                <header className="layout__header">
                    <div className="layout__header-left">
                        <button
                            className="layout__menu-btn btn-icon btn-ghost"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="layout__title">{title}</h1>
                    </div>
                    <div className="layout__header-right">
                        <div className="layout__search">
                            <Search size={16} className="layout__search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="layout__search-input"
                            />
                        </div>
                        {onExportData && (
                            <>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginRight: '8px' }}
                                    onClick={onExportData}
                                >
                                    Xuất JSON
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleClickImport}
                                >
                                    Nhập JSON
                                </button>
                                <input
                                    type="file"
                                    accept="application/json"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                        <button className="layout__notif btn-icon btn-ghost">
                            <Bell size={18} />
                            <span className="layout__notif-dot"></span>
                        </button>
                        <button
                            className="layout__avatar"
                            onClick={handleLogout}
                            title={user ? `Đăng xuất (${user.name || user.email})` : 'Đăng xuất'}
                        >
                            <span>
                                {(user?.name || user?.email || 'U')[0].toUpperCase()}
                            </span>
                        </button>
                    </div>
                </header>

                <main className="layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
