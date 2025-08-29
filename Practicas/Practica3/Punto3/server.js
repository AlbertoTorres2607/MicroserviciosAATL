require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { connectWithRetry } = require('./db');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

// Listado
app.get('/', async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    res.render('index', { tasks, error: null });
  } catch (e) {
    console.error(e);
    res.render('index', { tasks: [], error: 'Error consultando la base' });
  }
});

// Crear
app.post('/tasks', async (req, res) => {
  const { title, description, status } = req.body;
  if (!title?.trim()) return res.status(400).send('Título obligatorio. <a href="/">Volver</a>');
  await Task.create({ title: title.trim(), description: description?.trim() || '', status: status || 'pendiente' });
  res.redirect('/');
});

// Editar (form)
app.get('/tasks/:id/edit', async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) return res.status(404).send('No encontrada. <a href="/">Volver</a>');
  res.render('edit', { task });
});

// Actualizar
app.post('/tasks/:id', async (req, res) => {
  const { title, description, status } = req.body;
  await Task.findByIdAndUpdate(req.params.id, { title: title?.trim(), description: description?.trim(), status }, { runValidators: true });
  res.redirect('/');
});

// Eliminar
app.post('/tasks/:id/delete', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Arranque
connectWithRetry().then(() => app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`)));
