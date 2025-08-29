require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id DESC'
    );
    res.render('index', { users: rows, error: null });
  } catch (err) {
    res.render('index', { users: [], error: 'Error consultando la base de datos' });
  }
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).send('Faltan campos (nombre y correo). <a href="/">Volver</a>');
  }
  try {
    await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name.trim(), email.trim()]);
    res.redirect('/');
  } catch (err) {
    res.status(400).send(`No se pudo registrar: ${err.code || err.message}. <a href="/">Volver</a>`);
  }
});

app.post('/users/:id/delete', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(400).send(`No se pudo eliminar: ${err.code || err.message}. <a href="/">Volver</a>`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
