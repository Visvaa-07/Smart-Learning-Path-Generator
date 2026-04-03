const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const LearningPath = require('../models/LearningPath')
const Module = require('../models/Module')
const { generatePath } = require('../algorithm/pathGenerator')

// @route   POST /api/path/generate
// @desc    Generate a new path and save it for the user
router.post('/generate', protect, async (req, res) => {
  const { subject, skillLevel, hoursPerWeek, deadlineWeeks } = req.body

  try {
    const modules = await Module.find({ subject })
    if (!modules || modules.length === 0) {
      return res.status(404).json({ message: 'Subject not found or has no modules' })
    }

    // Run the algorithm
    const pathData = generatePath(modules, skillLevel, hoursPerWeek, deadlineWeeks)

    // Delete existing path if any
    await LearningPath.findOneAndDelete({ user: req.user._id })

    // Create new saved path
    const savedPath = await LearningPath.create({
      user: req.user._id,
      subject,
      skillLevel,
      hoursPerWeek,
      deadlineWeeks,
      totalWeeks: pathData.totalWeeks,
      totalHours: pathData.totalHours,
      isOverloaded: pathData.isOverloaded,
      modules: pathData.pathModules
    })

    res.status(201).json(savedPath)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/path/me
// @desc    Get current user's learning path
router.get('/me', protect, async (req, res) => {
  try {
    const path = await LearningPath.findOne({ user: req.user._id })
    if (path) {
      res.json(path)
    } else {
      res.status(404).json({ message: 'No active learning path found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/path/me
router.delete('/me', protect, async (req, res) => {
  try {
    await LearningPath.findOneAndDelete({ user: req.user._id })
    res.json({ message: 'Path deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
