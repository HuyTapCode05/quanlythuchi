import { useState } from 'react'
import { Mail, User, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './Account.css'

export default function Account() {
    const { user, updateProfile, changePassword, logout } = useAuth()
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [savingProfile, setSavingProfile] = useState(false)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [changingPassword, setChangingPassword] = useState(false)

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        if (!name || !email) {
            alert('Vui lòng nhập đầy đủ tên và email.')
            return
        }
        try {
            setSavingProfile(true)
            await updateProfile({ name: name.trim(), email: email.trim() })
            alert('Cập nhật tài khoản thành công.')
        } catch (error) {
            alert(error.message || 'Lỗi khi cập nhật tài khoản.')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Vui lòng nhập đầy đủ các trường mật khẩu.')
            return
        }
        if (newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự.')
            return
        }
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới nhập lại không khớp.')
            return
        }
        try {
            setChangingPassword(true)
            await changePassword(currentPassword, newPassword)
            alert('Đổi mật khẩu thành công.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            alert(error.message || 'Lỗi khi đổi mật khẩu.')
        } finally {
            setChangingPassword(false)
        }
    }

    return (
        <div className="account-page">
            <div className="account-page__header">
                <div>
                    <h1 className="account-page__title">Tài khoản</h1>
                    <p className="account-page__subtitle">
                        Cập nhật thông tin cá nhân và bảo mật đăng nhập.
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                        if (confirm('Đăng xuất khỏi tài khoản hiện tại?')) {
                            logout()
                            window.location.href = '/login'
                        }
                    }}
                >
                    Đăng xuất
                </button>
            </div>

            <div className="account-page__grid">
                <form className="account-card" onSubmit={handleSaveProfile}>
                    <h2 className="account-card__title">Thông tin cá nhân</h2>
                    <p className="account-card__desc">
                        Tên và email sẽ được dùng cho hiển thị và gửi thông báo.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <div className="account-input__wrap">
                            <User size={16} className="account-input__icon" />
                            <input
                                type="text"
                                className="form-input account-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Tên của bạn"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="account-input__wrap">
                            <Mail size={16} className="account-input__icon" />
                            <input
                                type="email"
                                className="form-input account-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={savingProfile}
                    >
                        {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>

                <form className="account-card" onSubmit={handleChangePassword}>
                    <h2 className="account-card__title">Đổi mật khẩu</h2>
                    <p className="account-card__desc">
                        Để an toàn, hãy định kỳ thay đổi mật khẩu của bạn.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu hiện tại</label>
                        <div className="account-input__wrap">
                            <Lock size={16} className="account-input__icon" />
                            <input
                                type="password"
                                className="form-input account-input"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
                        <div className="account-input__wrap">
                            <Lock size={16} className="account-input__icon" />
                            <input
                                type="password"
                                className="form-input account-input"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Ít nhất 6 ký tự"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nhập lại mật khẩu mới</label>
                        <div className="account-input__wrap">
                            <Lock size={16} className="account-input__icon" />
                            <input
                                type="password"
                                className="form-input account-input"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-secondary"
                        disabled={changingPassword}
                    >
                        {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    )
}


