const mongoose = require('mongoose')

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing from environment variables!')
    return
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 5000, // Fail fast if we can't connect
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`)
    // Don't exit, allow the app to boot otherwise Vercel kills it
  }
}

module.exports = connectDB
