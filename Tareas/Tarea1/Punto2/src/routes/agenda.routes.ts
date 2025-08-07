import { Router } from "express";
import { AppDataSource } from "../index";
import { Agenda } from "../entity/Agenda";

const router = Router();
const agendaRepository = () => AppDataSource.getRepository(Agenda);

// Listar todos los contactos
router.get('/', async (req, res) => {
    try {
        const contactos = await agendaRepository().find({
            order: {
                apellidos: 'ASC',
                nombres: 'ASC'
            }
        });
        res.render('index', { contactos });
    } catch (error) {
        console.error('Error al obtener contactos:', error);
        res.status(500).send('Error al obtener los contactos');
    }
});

// Mostrar formulario para agregar
router.get('/add', (req, res) => {
    res.render('add');
});

// Agregar nuevo contacto
router.post('/add', async (req, res) => {
    try {
        const nuevoContacto = agendaRepository().create({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            fecha_nacimiento: req.body.fecha_nacimiento,
            direccion: req.body.direccion,
            celular: req.body.celular,
            correo: req.body.correo
        });
        
        await agendaRepository().save(nuevoContacto);
        res.redirect('/');
    } catch (error) {
        console.error('Error al agregar contacto:', error);
        res.status(500).send('Error al agregar el contacto');
    }
});

// Mostrar formulario para editar
router.get('/edit/:id', async (req, res) => {
    try {
        const contacto = await agendaRepository().findOne({
            where: { id: parseInt(req.params.id) }
        });
        
        if (!contacto) {
            return res.status(404).send('Contacto no encontrado');
        }
        
        res.render('edit', { contacto });
    } catch (error) {
        console.error('Error al obtener contacto:', error);
        res.status(500).send('Error al obtener el contacto');
    }
});

// Actualizar contacto
router.post('/edit/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const contacto = await agendaRepository().findOne({
            where: { id }
        });
        
        if (!contacto) {
            return res.status(404).send('Contacto no encontrado');
        }
        
        // Actualizar campos
        contacto.nombres = req.body.nombres;
        contacto.apellidos = req.body.apellidos;
        contacto.fecha_nacimiento = req.body.fecha_nacimiento;
        contacto.direccion = req.body.direccion;
        contacto.celular = req.body.celular;
        contacto.correo = req.body.correo;
        
        await agendaRepository().save(contacto);
        res.redirect('/');
    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        res.status(500).send('Error al actualizar el contacto');
    }
});

// Eliminar contacto
router.get('/delete/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await agendaRepository().delete(id);
        
        if (resultado.affected === 0) {
            return res.status(404).send('Contacto no encontrado');
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        res.status(500).send('Error al eliminar el contacto');
    }
});

export default router;