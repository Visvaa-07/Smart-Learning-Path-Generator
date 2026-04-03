const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const dns = require('dns')

// Force DNS to use Google DNS for reliable Atlas SRV resolution
dns.setServers(['8.8.8.8'])

const connectDB = require('./config/db')

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/subjects', require('./routes/subjects'))
app.use('/api/path', require('./routes/path'))
app.use('/api/progress', require('./routes/progress'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PathWise API is running' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 PathWise API running on http://localhost:${PORT}`)
  console.log(`📦 MongoDB: ${process.env.MONGO_URI}`)
  console.log(`\n📋 Available routes:`)
  console.log(`   POST /api/auth/register`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/subjects`)
  console.log(`   POST /api/path/generate`)
  console.log(`   GET  /api/path/me`)
  console.log(`   PUT  /api/progress/:moduleId\n`)
})
