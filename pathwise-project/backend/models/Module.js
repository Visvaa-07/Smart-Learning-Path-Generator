const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  name: { type: String, required: true },
  base_hours: { type: Number, required: true },
  complexity_weight: { type: Number, required: true },
  priority: { type: Number, required: true },
  prerequisites: [String],
  resource: {
    platform: String,
    title: String,
    url: String,
    duration_mins: Number
  }
})

module.exports = mongoose.model('Module', moduleSchema)
