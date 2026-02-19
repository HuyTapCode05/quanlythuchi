import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const isAllowedOrigin = (origin) => {
    if (!origin) return true
    try {
        const url = new URL(origin)
        // local dev
        if (url.hostname === 'localhost') return true
        // GitHub Pages (any repo/user)
        if (url.hostname.endsWith('.github.io')) return true
        return false
    } catch {
        return false
    }
}

const corsOptions = {
    origin: (origin, callback) => {
        // Do NOT throw here; returning false avoids crashing preflight and avoids confusing logs.
        return callback(null, isAllowedOrigin(origin))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(express.json())

// Database setup
const dbPath = join(__dirname, 'fintrack.db')
const db = new Database(dbPath)

// Mail setup (optional - chỉ chạy khi có cấu hình SMTP)
let mailTransporter = null
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    mailTransporter.verify().then(() => {
        console.log('📧 SMTP sẵn sàng gửi mail')
    }).catch((err) => {
        console.error('❌ SMTP verify lỗi:', err?.message || err)
    })
} else {
    console.log('ℹ️ Không có cấu hình SMTP, API gửi mail sẽ trả về thông báo chưa cấu hình.')
}

// Initialize tables (without foreign keys for flexibility)
db.exec(`
    PRAGMA foreign_keys = OFF;
    
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        type TEXT NOT NULL,
        user_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        note TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category_id TEXT,
        note TEXT,
        frequency TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        next_date TEXT NOT NULL,
        user_id TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        target_date TEXT,
        user_id TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    PRAGMA foreign_keys = ON;
`)

// ===== USERS API =====
app.post('/api/users/register', (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Thiếu thông tin' })
        }

        const id = Date.now().toString()
        const stmt = db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)')
        stmt.run(id, name, email, password)
        
        res.json({ id, name, email })
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Email đã được sử dụng' })
        } else {
            res.status(500).json({ error: error.message })
        }
    }
})

app.post('/api/users/login', (req, res) => {
    try {
        const { email, password } = req.body
        const stmt = db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password = ?')
        const user = stmt.get(email, password)
        
        if (!user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
        }
        
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Lấy thông tin user theo id (dùng để validate phiên đăng nhập localStorage)
app.get('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('SELECT id, name, email FROM users WHERE id = ?')
        const user = stmt.get(id)
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' })
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Cập nhật thông tin tài khoản (tên, email)
app.put('/api/users/:id/profile', (req, res) => {
    try {
        const { id } = req.params
        const { name, email } = req.body

        if (!name || !email) {
            return res.status(400).json({ error: 'Thiếu tên hoặc email' })
        }

        // Kiểm tra email trùng với user khác
        const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?').get(email, id)
        if (existing) {
            return res.status(400).json({ error: 'Email đã được sử dụng bởi tài khoản khác' })
        }

        const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
        const result = stmt.run(name, email, id)
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' })
        }

        res.json({ id, name, email })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Đổi mật khẩu (cần mật khẩu hiện tại)
app.put('/api/users/:id/password', (req, res) => {
    try {
        const { id } = req.params
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
        }

        const user = db.prepare('SELECT id, password FROM users WHERE id = ?').get(id)
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' })
        }
        if (user.password !== currentPassword) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' })
        }

        const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?')
        stmt.run(newPassword, id)

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ===== CATEGORIES API =====
app.get('/api/categories/:userId', (req, res) => {
    try {
        const { userId } = req.params
        const stmt = db.prepare('SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC')
        const categories = stmt.all(userId)
        res.json(categories)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/categories', (req, res) => {
    try {
        const { id, name, color, icon, type, userId } = req.body
        const stmt = db.prepare('INSERT INTO categories (id, name, color, icon, type, user_id) VALUES (?, ?, ?, ?, ?, ?)')
        stmt.run(id, name, color || '', icon || '', type, userId || null)
        res.json({ id, name, color, icon, type })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.put('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params
        const { name, color, icon, type } = req.body
        const stmt = db.prepare('UPDATE categories SET name = ?, color = ?, icon = ?, type = ? WHERE id = ?')
        stmt.run(name, color, icon, type, id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?')
        stmt.run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ===== TRANSACTIONS API =====
app.get('/api/transactions/:userId', (req, res) => {
    try {
        const { userId } = req.params
        const stmt = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
        const transactions = stmt.all(userId)
        res.json(transactions)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/transactions', (req, res) => {
    try {
        const { id, type, amount, category, note, userId, createdAt } = req.body
        
        console.log('Received transaction data:', { id, type, amount, category, note, userId, createdAt })
        
        if (!id || !type || amount === undefined || !userId || !createdAt) {
            return res.status(400).json({ error: `Thiếu thông tin bắt buộc: id=${!!id}, type=${!!type}, amount=${amount !== undefined}, userId=${!!userId}, createdAt=${!!createdAt}` })
        }
        
        // Temporarily disable foreign keys for insert
        db.pragma('foreign_keys = OFF')
        
        const stmt = db.prepare('INSERT INTO transactions (id, type, amount, category, note, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        const result = stmt.run(id, type, Number(amount), category || '', note || '', userId, createdAt)
        
        db.pragma('foreign_keys = ON')
        
        if (result.changes === 0) {
            throw new Error('Không thể thêm giao dịch vào database')
        }
        
        res.json({ id, type, amount: Number(amount), category: category || '', note: note || '', createdAt })
    } catch (error) {
        console.error('Add transaction error:', error)
        console.error('Error stack:', error.stack)
        res.status(500).json({ error: error.message || 'Lỗi không xác định' })
    }
})

app.put('/api/transactions/:id', (req, res) => {
    try {
        const { id } = req.params
        const { type, amount, category, note, createdAt } = req.body
        const stmt = db.prepare('UPDATE transactions SET type = ?, amount = ?, category = ?, note = ?, created_at = ? WHERE id = ?')
        stmt.run(type, amount, category, note, createdAt, id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/transactions/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('DELETE FROM transactions WHERE id = ?')
        stmt.run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ===== BUDGETS API =====
app.get('/api/budgets/:userId', (req, res) => {
    try {
        const { userId } = req.params
        const stmt = db.prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC')
        const budgets = stmt.all(userId)
        res.json(budgets)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/budgets', (req, res) => {
    try {
        const { id, categoryId, amount, period, userId } = req.body
        
        if (!id || !categoryId || !amount || !period || !userId) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
        }
        
        const stmt = db.prepare('INSERT INTO budgets (id, category_id, amount, period, user_id) VALUES (?, ?, ?, ?, ?)')
        const result = stmt.run(id, categoryId, Number(amount), period, userId)
        
        if (result.changes === 0) {
            throw new Error('Không thể thêm ngân sách vào database')
        }
        
        res.json({ id, categoryId, amount: Number(amount), period, userId })
    } catch (error) {
        console.error('Add budget error:', error)
        res.status(500).json({ error: error.message || 'Lỗi không xác định' })
    }
})

app.put('/api/budgets/:id', (req, res) => {
    try {
        const { id } = req.params
        const { categoryId, amount, period } = req.body
        
        if (!categoryId || !amount || !period) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
        }
        
        const stmt = db.prepare('UPDATE budgets SET category_id = ?, amount = ?, period = ? WHERE id = ?')
        stmt.run(categoryId, Number(amount), period, id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/budgets/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('DELETE FROM budgets WHERE id = ?')
        stmt.run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ===== RECURRING TRANSACTIONS API =====
app.get('/api/recurring/:userId', (req, res) => {
    try {
        const { userId } = req.params
        const stmt = db.prepare('SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY created_at DESC')
        const recurring = stmt.all(userId)
        res.json(recurring)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/recurring', (req, res) => {
    try {
        const { id, type, amount, categoryId, note, frequency, startDate, endDate, nextDate, userId, isActive } = req.body
        
        if (!id || !type || !amount || !frequency || !startDate || !nextDate || !userId) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
        }
        
        const stmt = db.prepare(`
            INSERT INTO recurring_transactions 
            (id, type, amount, category_id, note, frequency, start_date, end_date, next_date, user_id, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
            id, type, Number(amount), categoryId || '', note || '', 
            frequency, startDate, endDate || null, nextDate, userId, isActive !== undefined ? isActive : 1
        )
        
        if (result.changes === 0) {
            throw new Error('Không thể thêm giao dịch định kỳ vào database')
        }
        
        res.json({ id, type, amount: Number(amount), categoryId, note, frequency, startDate, endDate, nextDate, isActive })
    } catch (error) {
        console.error('Add recurring error:', error)
        res.status(500).json({ error: error.message || 'Lỗi không xác định' })
    }
})

// Gửi email nhắc nhở giao dịch định kỳ
app.post('/api/recurring/send-reminders', async (req, res) => {
    try {
        const { userId } = req.body
        if (!userId) {
            return res.status(400).json({ error: 'Thiếu userId' })
        }

        if (!mailTransporter) {
            return res.status(500).json({ error: 'SMTP chưa được cấu hình trên server' })
        }

        const userStmt = db.prepare('SELECT email, name FROM users WHERE id = ?')
        const user = userStmt.get(userId)
        if (!user) {
            return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const threeDays = new Date(today)
        threeDays.setDate(today.getDate() + 3)

        const startIso = today.toISOString().split('T')[0]
        const endIso = threeDays.toISOString().split('T')[0]

        const recurringStmt = db.prepare(`
            SELECT *
            FROM recurring_transactions
            WHERE user_id = ?
              AND is_active = 1
              AND date(next_date) BETWEEN date(?) AND date(?)
            ORDER BY next_date ASC
        `)
        const list = recurringStmt.all(userId, startIso, endIso)

        if (!list.length) {
            return res.json({ sent: false, message: 'Không có giao dịch định kỳ sắp đến hạn trong 3 ngày tới.' })
        }

        const formatAmount = (value) =>
            Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

        const escapeHtml = (str) =>
            String(str ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#39;')

        const getEmailGreetingName = (u) => {
            const raw = String(u?.name || u?.email || '').trim()
            if (!raw) return 'bạn'
            const firstToken = raw.split(/\s+/).filter(Boolean)[0] || raw
            const shortToken = firstToken.length > 32 ? firstToken.slice(0, 32) : firstToken
            return escapeHtml(shortToken)
        }

        const formatDateShort = (iso) => {
            if (!iso) return ''
            const d = new Date(iso)
            const dd = String(d.getDate()).padStart(2, '0')
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const yyyy = d.getFullYear()
            return `${dd}/${mm}/${yyyy}`
        }

        const plainLines = list.map((r) => {
            const when = formatDateShort(r.next_date || r.nextDate)
            const typeLabel = r.type === 'income' ? 'Thu' : 'Chi'
            return `- ${typeLabel} ${formatAmount(r.amount)} (${r.frequency}) - lần tới: ${when}${r.note ? ` - ${r.note}` : ''}`
        })

        const text = [
            `Chào ${String(user?.name || user?.email || 'bạn').trim().split(/\s+/).filter(Boolean)[0] || 'bạn'},`,
            '',
            'Dưới đây là các giao dịch định kỳ sắp đến hạn trong 3 ngày tới:',
            '',
            ...plainLines,
            '',
            'Bạn có thể xem chi tiết và chỉnh sửa tại mục "Giao dịch định kỳ" trong FinTrack.',
            '',
            '— FinTrack'
        ].join('\n')

        const baseUrl = process.env.APP_URL || 'http://localhost:3000'

        const htmlRows = list.map((r) => {
            const when = formatDateShort(r.next_date || r.nextDate)
            const typeLabel = r.type === 'income' ? 'Thu' : 'Chi'
            const typeColor = r.type === 'income' ? '#00b894' : '#ff6b6b'
            const freqMap = {
                daily: 'Hằng ngày',
                weekly: 'Hằng tuần',
                monthly: 'Hằng tháng',
                yearly: 'Hằng năm'
            }
            const freqLabel = freqMap[r.frequency] || r.frequency
            return `
                <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size:13px;">
                        <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${typeColor}15;color:${typeColor};font-size:11px;font-weight:600;margin-right:6px;">
                            ${typeLabel}
                        </span>
                        ${r.note ? `<span>${r.note}</span>` : `<span>${typeLabel} định kỳ</span>`}
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size:13px;color:#555;">
                        ${freqLabel}
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size:13px;color:#555;">
                        ${when}
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size:13px; text-align:right; color:${typeColor}; font-weight:600;">
                        ${formatAmount(r.amount)}
                    </td>
                </tr>
            `
        }).join('')

        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>Nhắc nhở giao dịch định kỳ - FinTrack</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding:24px 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#020617;border-radius:16px;border:1px solid #1f2937;box-shadow:0 12px 45px rgba(15,23,42,.7);overflow:hidden;">
                    <tr>
                        <td style="padding:20px 24px 16px 24px;border-bottom:1px solid #1f2937;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                                <tr>
                                    <td align="center">
                                        <div style="width:32px;height:32px;border-radius:999px;background:linear-gradient(135deg,#6366f1,#22c55e);display:inline-block;line-height:32px;text-align:center;color:#fff;font-weight:800;font-size:14px;letter-spacing:.5px;">
                                            FT
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top:8px;">
                                        <div style="color:#e5e7eb;font-weight:600;font-size:14px;line-height:1.2;">FinTrack</div>
                                        <div style="color:#9ca3af;font-size:11px;line-height:1.2;">Nhắc nhở giao dịch định kỳ</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 24px 8px 24px;color:#e5e7eb;font-size:14px;">
                            <p style="margin:0 0 8px 0;">Chào ${getEmailGreetingName(user)},</p>
                            <p style="margin:0 0 12px 0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                Dưới đây là các <strong>giao dịch định kỳ</strong> của bạn sẽ diễn ra trong <strong>3 ngày tới</strong>.
                                Bạn có thể kiểm tra lại để đảm bảo số dư tài khoản luôn sẵn sàng.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 16px 8px 16px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;background:#020617;border:1px solid #1f2937;">
                                <thead>
                                    <tr style="background:#020617;">
                                        <th align="left" style="padding:10px 12px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Giao dịch</th>
                                        <th align="left" style="padding:10px 12px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Tần suất</th>
                                        <th align="left" style="padding:10px 12px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Lần tới</th>
                                        <th align="right" style="padding:10px 12px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${htmlRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:12px 24px 20px 24px;font-size:12px;color:#9ca3af;">
                            <p style="margin:0 0 8px 0;">
                                Bạn có thể xem và chỉnh sửa các giao dịch này tại mục
                                <a href="${baseUrl}/recurring" style="color:#6366f1;text-decoration:none;">Giao dịch định kỳ</a> trong FinTrack.
                            </p>
                            <p style="margin:0;color:#4b5563;font-size:11px;">
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp. Nếu bạn không muốn nhận email nhắc nữa, bạn có thể tắt giao dịch định kỳ trong ứng dụng.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `

        await mailTransporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: 'Nhắc nhở giao dịch định kỳ - FinTrack',
            text,
            html
        })

        res.json({ sent: true, count: list.length, email: user.email })
    } catch (error) {
        console.error('Send recurring reminders error:', error)
        res.status(500).json({ error: error.message || 'Lỗi khi gửi email nhắc nhở' })
    }
})

app.put('/api/recurring/:id', (req, res) => {
    try {
        const { id } = req.params
        const { type, amount, categoryId, note, frequency, startDate, endDate, nextDate, isActive } = req.body
        
        const stmt = db.prepare(`
            UPDATE recurring_transactions 
            SET type = ?, amount = ?, category_id = ?, note = ?, frequency = ?, 
                start_date = ?, end_date = ?, next_date = ?, is_active = ?
            WHERE id = ?
        `)
        stmt.run(
            type, Number(amount), categoryId || '', note || '', frequency,
            startDate, endDate || null, nextDate, isActive !== undefined ? isActive : 1, id
        )
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/recurring/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('DELETE FROM recurring_transactions WHERE id = ?')
        stmt.run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ===== SAVINGS GOALS API =====
app.get('/api/savings/:userId', (req, res) => {
    try {
        const { userId } = req.params
        console.log('Loading savings goals for user:', userId)
        const stmt = db.prepare('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC')
        const goals = stmt.all(userId)
        console.log('Found goals:', goals.length)
        res.json(goals)
    } catch (error) {
        console.error('Get savings goals error:', error)
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/savings', (req, res) => {
    try {
        const { id, name, targetAmount, currentAmount, targetDate, userId, isCompleted } = req.body
        
        console.log('Received savings goal data:', { id, name, targetAmount, currentAmount, targetDate, userId, isCompleted })
        
        if (!id || !name || !targetAmount || !userId) {
            return res.status(400).json({ error: `Thiếu thông tin bắt buộc: id=${!!id}, name=${!!name}, targetAmount=${!!targetAmount}, userId=${!!userId}` })
        }
        
        const stmt = db.prepare(`
            INSERT INTO savings_goals 
            (id, name, target_amount, current_amount, target_date, user_id, is_completed) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
            id, name, Number(targetAmount), Number(currentAmount || 0), 
            targetDate || null, userId, isCompleted !== undefined ? isCompleted : 0
        )
        
        console.log('Insert result:', result)
        
        if (result.changes === 0) {
            throw new Error('Không thể thêm mục tiêu tiết kiệm vào database')
        }
        
        res.json({ id, name, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount || 0), targetDate, isCompleted })
    } catch (error) {
        console.error('Add savings goal error:', error)
        console.error('Error stack:', error.stack)
        res.status(500).json({ error: error.message || 'Lỗi không xác định' })
    }
})

app.put('/api/savings/:id', (req, res) => {
    try {
        const { id } = req.params
        const { name, targetAmount, currentAmount, targetDate, isCompleted } = req.body
        
        const stmt = db.prepare(`
            UPDATE savings_goals 
            SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, is_completed = ?
            WHERE id = ?
        `)
        stmt.run(
            name, Number(targetAmount), Number(currentAmount || 0), 
            targetDate || null, isCompleted !== undefined ? isCompleted : 0, id
        )
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/savings/:id', (req, res) => {
    try {
        const { id } = req.params
        const stmt = db.prepare('DELETE FROM savings_goals WHERE id = ?')
        stmt.run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    console.error('Stack:', error.stack)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📁 Database: ${dbPath}`)
    console.log('✅ Server đã sẵn sàng nhận requests...')
})

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} đã được sử dụng!`)
        console.error('💡 Hãy chạy lệnh sau để dừng process:')
        console.error(`   taskkill /PID <PID> /F`)
        console.error('   Hoặc tìm PID bằng: netstat -ano | findstr :3001')
    } else {
        console.error('❌ Server error:', error)
    }
    db.close()
    process.exit(1)
})

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n🛑 Đang dừng server...')
    server.close(() => {
        db.close()
        console.log('✅ Server đã dừng')
        process.exit(0)
    })
})

