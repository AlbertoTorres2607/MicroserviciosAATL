const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pendiente', 'en_progreso', 'completado'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Task', TaskSchema);
