import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const dbPath = path.join(process.cwd(), 'data.json')

function initializeDB() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [
        {
          id: '1',
          email: 'superadmin@mailer.com',
          password: bcrypt.hashSync('superadmin123', 10),
          name: 'Super Admin',
          role: 'superadmin',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      senders: []
    }
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2))
  }
}

function readDB() {
  if (!fs.existsSync(dbPath)) {
    initializeDB()
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export { readDB, writeDB, initializeDB }
