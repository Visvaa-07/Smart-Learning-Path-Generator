const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({ name, email, password })

    if (user) {
      res.status(201).json({
        user: { _id: user._id, name: user.name, email: user.email },
        token: generateToken(user._id)
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: { _id: user._id, name: user.name, email: user.email },
        token: generateToken(user._id)
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please try again.' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user)
})

module.exports = router
