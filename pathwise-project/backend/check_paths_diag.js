const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const User = require('./models/User');
const LearningPath = require('./models/LearningPath');

dotenv.config();

async function checkPaths() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'visvaa@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    const indexList = await LearningPath.collection.listIndexes().toArray();
    console.log('INDEX_LIST_START');
    indexList.forEach(idx => console.log(JSON.stringify(idx)));
    console.log('INDEX_LIST_END');

    const paths = await LearningPath.find({ user: user._id });
    console.log(`Found ${paths.length} paths for ${user.email}:`);
    paths.forEach(p => {
      console.log(`- ${p.subject} (ID: ${p._id}, Skill: ${p.skillLevel}, Generated: ${p.generatedAt})`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPaths();
