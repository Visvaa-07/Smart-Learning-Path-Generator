const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function checkWhyOnlyOne() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const LearningPath = mongoose.connection.collection('learningpaths');
    const indexes = await LearningPath.indexes();
    
    console.log('UNIQUE_INDEXES_FOUND:');
    indexes.forEach(idx => {
      if (idx.unique) {
        console.log(`- Name: ${idx.name}, Key: ${JSON.stringify(idx.key)}`);
      }
    });

    const userCount = await mongoose.connection.collection('users').countDocuments({ email: 'visvaa@gmail.com' });
    console.log('User count for visvaa@gmail.com:', userCount);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkWhyOnlyOne();
