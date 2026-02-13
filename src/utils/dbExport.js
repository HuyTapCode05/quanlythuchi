import initSqlJs from 'sql.js'

let SQL = null

const initSQL = async () => {
    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`
        })
    }
    return SQL
}

export const exportToDB = async (categories, transactions) => {
    const SQL = await initSQL()
    const db = new SQL.Database()

    // Tạo bảng categories
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT,
            icon TEXT,
            type TEXT NOT NULL
        )
    `)

    // Tạo bảng transactions
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT,
            note TEXT,
            createdAt TEXT NOT NULL
        )
    `)

    // Insert categories
    const catStmt = db.prepare(`
        INSERT INTO categories (id, name, color, icon, type)
        VALUES (?, ?, ?, ?, ?)
    `)
    categories.forEach(cat => {
        catStmt.run([cat.id, cat.name, cat.color || '', cat.icon || '', cat.type])
    })
    catStmt.free()

    // Insert transactions
    const txStmt = db.prepare(`
        INSERT INTO transactions (id, type, amount, category, note, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
    `)
    transactions.forEach(tx => {
        txStmt.run([
            tx.id,
            tx.type,
            tx.amount,
            tx.category || '',
            tx.note || '',
            tx.createdAt
        ])
    })
    txStmt.free()

    // Export ra file .db
    const data = db.export()
    db.close()
    return data
}

export const importFromDB = async (dbFile) => {
    const SQL = await initSQL()
    const uint8Array = new Uint8Array(dbFile)
    const db = new SQL.Database(uint8Array)

    // Đọc categories
    const catResult = db.exec('SELECT * FROM categories')
    const categories = catResult.length > 0
        ? catResult[0].values.map(row => ({
            id: row[0],
            name: row[1],
            color: row[2] || '#9d9dba',
            icon: row[3] || '📌',
            type: row[4]
        }))
        : []

    // Đọc transactions
    const txResult = db.exec('SELECT * FROM transactions')
    const transactions = txResult.length > 0
        ? txResult[0].values.map(row => ({
            id: row[0],
            type: row[1],
            amount: row[2],
            category: row[3] || '',
            note: row[4] || '',
            createdAt: row[5]
        }))
        : []

    db.close()
    return { categories, transactions }
}

