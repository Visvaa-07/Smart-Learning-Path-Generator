const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const LearningPath = mongoose.model('LearningPath', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }));
    
    try {
      await LearningPath.collection.dropIndex('user_1');
      console.log('Successfully dropped unique index: user_1');
    } catch (e) {
      console.log('Index user_1 not found or already dropped');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixDatabase();
