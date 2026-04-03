const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const LearningPath = require('../models/LearningPath')

// @route   PUT /api/progress/:moduleId
// @desc    Update completion status of a module in the user's current path
router.put('/:moduleId', protect, async (req, res) => {
  const { completed } = req.body

  try {
    const path = await LearningPath.findOne({ user: req.user._id })
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' })
    }

    const modIndex = path.modules.findIndex(
      m => m._id.toString() === req.params.moduleId || m.moduleId.toString() === req.params.moduleId
    )

    if (modIndex === -1) {
      return res.status(404).json({ message: 'Module not found in this path: ' + req.params.moduleId })
    }

    path.modules[modIndex].completed = completed
    path.modules[modIndex].completedAt = completed ? new Date() : null

    await path.save()
    res.json({ message: 'Progress updated', module: path.modules[modIndex] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
