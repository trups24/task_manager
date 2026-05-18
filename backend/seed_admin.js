const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin already exists');
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
