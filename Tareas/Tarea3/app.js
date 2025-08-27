require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const Contacto = require('./models/Contacto');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Rutas ---
app.get('/', async (req, res) => {
  const consulta = req.query.nombres;
  const query = consulta ? { nombres: consulta } : {};
  const contactos = await Contacto.find(query);
  res.render('index', { contactos });
});

app.get('/contactos/new', (req, res) => {
  res.render('create');
});

app.post('/contactos', async (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;
  await Contacto.create({ nombres, apellidos, fecha_nacimiento, direccion, celular, correo });
  res.redirect('/');
});

app.get('/contactos/:id', async (req, res) => {
  const contacto = await Contacto.findById(req.params.id);
  res.render('show', { contacto });
});

app.get('/contactos/:id/edit', async (req, res) => {
  const contacto = await Contacto.findById(req.params.id);
  res.render('edit', { contacto });
});

app.put('/contactos/:id', async (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;
  await Contacto.findByIdAndUpdate(req.params.id, { nombres, apellidos, fecha_nacimiento, direccion, celular, correo });
  res.redirect('/');
});

app.delete('/contactos/:id', async (req, res) => {
  await Contacto.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// --- Puerto ---
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agenda';
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error MongoDB:', err);
    process.exit(1);
  }
}

start();