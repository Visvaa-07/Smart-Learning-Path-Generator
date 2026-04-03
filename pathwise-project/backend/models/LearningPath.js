const mongoose = require('mongoose')

const pathModuleSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  name: { type: String, required: true },
  adjustedHours: { type: Number, required: true },
  allocatedHours: { type: Number },
  completion: { type: Number },
  complexityWeight: { type: Number },
  weekStart: { type: Number, required: true },
  weekEnd: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  resource: Object
})

const learningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  skillLevel: { type: String, required: true },
  hoursPerWeek: { type: Number, required: true },
  deadlineWeeks: { type: Number },
  totalWeeks: { type: Number, required: true },
  totalHours: { type: Number, required: true },
  totalRequiredHours: { type: Number },
  totalAvailableHours: { type: Number },
  isOverloaded: { type: Boolean, default: false },
  modules: [pathModuleSchema],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('LearningPath', learningPathSchema)
