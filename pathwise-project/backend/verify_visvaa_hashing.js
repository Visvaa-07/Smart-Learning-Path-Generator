const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Fix for Atlas SRV resolution
dotenv.config();

async function verifyHashing() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'visvaa@gmail.com' });
    if (!user) {
      console.log('❌ User "visvaa@gmail.com" not found.');
      process.exit(1);
    }

    console.log('\n--- User Details ---');
    console.log('Email:   ', user.email);
    console.log('Password (DB):', user.password);

    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      console.log('\n✅ Hashing Status: The password IS encrypted (bcrypt).');
    } else {
      console.log('\n⚠️ Hashing Status: The password IS NOT encrypted (plain text).');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyHashing();
