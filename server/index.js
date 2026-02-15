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

