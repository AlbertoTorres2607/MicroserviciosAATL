const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Contacto = require('./models/Contacto');

const app = express();

// Configuración
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/agenda', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Rutas
app.get('/', async (req, res) => {
    const consulta = req.query.nombres;
    
    if (consulta) {
        const contactos = await Contacto.find({ nombres: consulta });
        return res.render('index', { contactos });
    }
    const contactos = await Contacto.find();
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

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});