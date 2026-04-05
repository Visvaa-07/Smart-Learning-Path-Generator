const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const LearningPath = require('../models/LearningPath')
const Module = require('../models/Module')
const { generatePath } = require('../algorithm/pathGenerator')

// @route   POST /api/path/generate
router.post('/generate', protect, async (req, res) => {
  const { subject, skillLevel, hoursPerWeek, deadlineWeeks } = req.body
  console.log(`[BACKEND] Generating path for user ${req.user._id}, subject: ${subject}`);

  try {
    const modules = await Module.find({ subject })
    if (!modules || modules.length === 0) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    const pathData = generatePath(modules, skillLevel, hoursPerWeek, deadlineWeeks)

    // IMPORTANT: MULTI-PATH SUPPORT - NO DELETE
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

    console.log(`[BACKEND] Successfully created path ID ${savedPath._id}`);
    res.status(201).json(savedPath)
  } catch (error) {
    console.error('[BACKEND] Error in /generate:', error.message);
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/path/me
router.get('/me', protect, async (req, res) => {
  try {
    console.log(`[BACKEND] Fetching all paths for user ${req.user._id}`);
    const paths = await LearningPath.find({ user: req.user._id }).sort('-createdAt')
    console.log(`[BACKEND] Found ${paths.length} paths`);
    res.json(paths)
  } catch (error) {
    console.error('[BACKEND] Error in /me:', error.message);
    res.status(500).json({ message: error.message })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user._id })
    if (path) res.json(path)
    else res.status(404).json({ message: 'Path not found' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    console.log(`[BACKEND] Deleting path ${req.params.id} for user ${req.user._id}`);
    const path = await LearningPath.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (path) res.json({ message: 'Deleted' })
    else res.status(404).json({ message: 'Not found' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
