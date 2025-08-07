import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import bodyParser from "body-parser";
import path from "path";
import agendaRoutes from "./routes/agenda.routes";
import { Agenda } from "./entity/Agenda";
import expressLayouts from 'express-ejs-layouts';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "bd_agenda_torm",
    synchronize: true,
    logging: false,
    entities: [Agenda],
    migrations: [],
    subscribers: [],
});

// Inicialización
AppDataSource.initialize()
    .then(async () => {
        console.log("Conexión a MySQL establecida con TypeORM");

        // Crear app Express
        const app = express();
        const PORT = 3001;

        // Middleware
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, '../public')));
        app.use(expressLayouts);
        
        // Configurar motor de vistas
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.set('layout', 'layout');

        // Rutas
        app.use('/', agendaRoutes);

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor TypeORM corriendo en http://localhost:${PORT}`);
        });

    })
    .catch(error => console.error("Error durante la inicialización de TypeORM:", error));