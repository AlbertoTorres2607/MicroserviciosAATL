const express = require('express');
const app = express();
const PORT = 8080;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware para parsear datos del formulario
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS)
app.use(express.static('public'));

// Ruta principal - mostrar el formulario
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para procesar el cálculo y mostrar resultado
app.post('/calcular', (req, res) => {
    const { operacion, a, b } = req.body;
    
    // Convertir a números
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    
    // Validar que sean números válidos
    if (isNaN(num1) || isNaN(num2)) {
        return res.render('resultado', {
            error: 'Por favor ingresa números válidos',
            resultado: null,
            operacion: null,
            num1: a,
            num2: b
        });
    }
    
    let resultado;
    let nombreOperacion;
    
    switch (operacion) {
        case 'sumar':
            resultado = num1 + num2;
            nombreOperacion = 'Suma';
            break;
        case 'restar':
            resultado = num1 - num2;
            nombreOperacion = 'Resta';
            break;
        case 'multiplicar':
            resultado = num1 * num2;
            nombreOperacion = 'Multiplicación';
            break;
        case 'dividir':
            if (num2 === 0) {
                return res.render('resultado', {
                    error: 'No se puede dividir por cero',
                    resultado: null,
                    operacion: 'División',
                    num1: num1,
                    num2: num2
                });
            }
            resultado = num1 / num2;
            nombreOperacion = 'División';
            break;
        default:
            return res.render('resultado', {
                error: 'Operación no válida',
                resultado: null,
                operacion: null,
                num1: num1,
                num2: num2
            });
    }
    
    // Renderizar página de resultado con los datos
    res.render('resultado', {
        error: null,
        resultado: resultado,
        operacion: nombreOperacion,
        num1: num1,
        num2: num2,
        operacionSeleccionada: operacion
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});