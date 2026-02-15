import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, TrendingUp, TrendingDown, Tag, ChevronLeft,
    ChevronRight, Wallet
} from 'lucide-react'
import './Sidebar.css'

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/income', icon: TrendingUp, label: 'Thu nhập' },
    { path: '/expense', icon: TrendingDown, label: 'Chi tiêu' },
    { path: '/categories', icon: Tag, label: 'Danh mục' },
]

export default function Sidebar({ collapsed, onToggle }) {
    const location = useLocation()

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__header">
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">
                        <Wallet size={22} />
                    </div>
                    {!collapsed && <span className="sidebar__logo-text">FinTrack</span>}
                </div>
                <button className="sidebar__toggle" onClick={onToggle}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                {!collapsed && (
                    <div className="sidebar__version">
                        <span>FinTrack v1.0</span>
                    </div>
                )}
            </div>
        </aside>
    )
}
