const express = require('express')
const router = express.Router()
const Module = require('../models/Module')

// @route   GET /api/subjects
// @desc    Get all subjects and their module counts
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find({})
    
    // Group by subject and count
    const map = {}
    modules.forEach(m => {
      if (!map[m.subject]) {
        map[m.subject] = {
          _id: m.subject,
          name: m.subject,
          modules: 0,
          // Assign dynamic icons since they aren't in DB
          icon: m.subject === 'Data Science' ? '📊' : 
                m.subject === 'Web Development' ? '🌐' :
                m.subject === 'Mathematics' ? '📐' :
                m.subject === 'Machine Learning' ? '🤖' :
                m.subject === 'Cybersecurity' ? '🔐' : '📱'
        }
      }
      map[m.subject].modules += 1
    })

    const subjects = Object.values(map)
    res.json(subjects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/subjects/:subject/modules
router.get('/:subject/modules', async (req, res) => {
  try {
    const modules = await Module.find({ subject: req.params.subject }).sort({ priority: 1 })
    res.json(modules)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
