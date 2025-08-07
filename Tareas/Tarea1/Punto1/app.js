const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");

const app = express();
const PORT = 3000;

app.use(ejsLayouts); // Usar express-ejs-layouts
app.use(bodyParser.urlencoded({ extended: true })); // Parsear datos de formularios
app.use(express.static("public")); // Servir archivos estáticos
app.set("layout", "layout"); // Configurar el layout por defecto
app.set("view engine", "ejs"); // Configurar EJS como motor de plantillas
app.set("views", path.join(__dirname, "views")); // Configurar la carpeta de vistas

app.get("/", (req, res) => {
  const query = "SELECT * FROM agenda ORDER BY apellidos, nombres";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los productos:", err);
      return res.status(500).send("Error al obtener los contactos");
    }
    res.render("index", { contactos: results });
  });
});
// Mostrar formulario para agregar producto
app.get("/add", (req, res) => {
  res.render("add");
});

// Procesar formulario para agregar producto
app.post("/add", (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } =
    req.body;
  const query =
    "INSERT INTO agenda (nombres, apellidos, fecha_nacimiento, direccion, celular, correo) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo],
    (err) => {
      if (err) {
        console.error("Error al agregar el contacto:", err);
        return res.status(500).send("Error al agregar el contacto");
      }
      res.redirect("/");
    }
  );
});
// Mostrar formulario para editar producto
app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM agenda WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener el contacto:", err);
      return res.status(500).send("Error al obtener el contacto");
    }
    res.render("edit", { contacto: results[0] });
  });
});

app.post("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } =
    req.body;
  const query =
    "UPDATE agenda SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, direccion = ?, celular = ?, correo = ? WHERE id = ?";
  db.query(
    query,
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo, id],
    (err) => {
      if (err) {
        console.error("Error al actualizar el contacto:", err);
        return res.status(500).send("Error al actualizar el contacto");
      }
      res.redirect("/");
    }
  );
});

// Eliminar producto
app.get("/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM agenda WHERE id = ?";

  db.query(query, [id], (err) => {
    if (err) {
      console.error("Error al eliminar el contacto:", err);
      return res.status(500).send("Error al eliminar el contacto");
    }
    res.redirect("/");
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});