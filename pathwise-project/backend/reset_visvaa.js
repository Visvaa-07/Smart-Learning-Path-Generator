const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const dns = require('dns');

dns.setServers(['8.8.8.8']);
dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    let user = await User.findOne({ email: 'visvaa@gmail.com' });
    
    if (user) {
      user.password = 'visvaa123';
      await user.save();
      console.log('✅ Password reset to "visvaa123" for visvaa@gmail.com');
    } else {
      await User.create({ name: 'Visvaa', email: 'visvaa@gmail.com', password: 'visvaa123' });
      console.log('✅ User "visvaa@gmail.com" created with "visvaa123"');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
