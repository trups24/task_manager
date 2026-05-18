const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/taskmanager', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log("Users in DB:", users);
  process.exit(0);
})
.catch(err => {
  console.error("Connection error:", err);
  process.exit(1);
});
