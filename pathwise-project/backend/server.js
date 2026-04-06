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
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true
}))
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

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
}

module.exports = app

