const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

const connectDB = require('./config/db')

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Allowed origins: prioritize Environment Variable, fallback to local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) // Remove any undefined/null values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

// Middleware
app.use(cors(corsOptions))

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions))

app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Welcome to the PathWise API' })
})

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

// Only start the server if NOT running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 PathWise API running on http://localhost:${PORT}`)
    console.log(`📦 MongoDB: Connection string is masked for security.`)
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

