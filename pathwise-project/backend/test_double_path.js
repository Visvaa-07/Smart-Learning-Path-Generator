const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function testDoublePath() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    const LearningPath = mongoose.model('LearningPath', new mongoose.Schema({ 
      user: mongoose.Schema.Types.ObjectId,
      subject: String,
      skillLevel: String,
      hoursPerWeek: Number,
      totalWeeks: Number,
      totalHours: Number,
      modules: Array
    }));

    const user = await User.findOne({ email: 'visvaa@gmail.com' });
    if (!user) { throw new Error('User not found'); }

    // Clear and create two
    await LearningPath.deleteMany({ user: user._id });
    console.log('Cleared existing paths');

    await LearningPath.create({
      user: user._id, subject: 'Test Path 1', skillLevel: 'beginner', hoursPerWeek: 10, totalWeeks: 4, totalHours: 40, modules: []
    });
    console.log('Created Path 1');

    await LearningPath.create({
      user: user._id, subject: 'Test Path 2', skillLevel: 'advanced', hoursPerWeek: 20, totalWeeks: 4, totalHours: 80, modules: []
    });
    console.log('Created Path 2');

    const finalCount = await LearningPath.countDocuments({ user: user._id });
    console.log('Final count of paths:', finalCount);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testDoublePath();
