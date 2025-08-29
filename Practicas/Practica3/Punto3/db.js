const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksdb';

async function connectWithRetry(retries = 10, delayMs = 1500) {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Conectado a MongoDB:', uri);
      return;
    } catch (err) {
      console.log(`⚠️  Intento ${i}/${retries} falló: ${err.message}`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('No se pudo conectar a MongoDB');
}
module.exports = { connectWithRetry };
