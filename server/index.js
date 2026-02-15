import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database setup
const dbPath = join(__dirname, 'fintrack.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        note TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
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
        
        const stmt = db.prepare('INSERT INTO transactions (id, type, amount, category, note, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        const result = stmt.run(id, type, Number(amount), category || '', note || '', userId, createdAt)
        
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
        console.error(`❌ Port ${PORT} đã được sử dụng. Hãy dừng process khác hoặc đổi port.`)
    } else {
        console.error('❌ Server error:', error)
    }
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

