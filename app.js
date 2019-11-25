// Requires *Importacion de librerias (terceros o personalizadas) que ocupamos para que funcione algo...
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();


// Body parser
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded -- Detecta cualquier informacion en el body y lo transforma en un objeto Json utilizable
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenRoutes = require('./routes/imagen');


// Conectar a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'Online');
});


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenRoutes);
app.use('/', appRoutes);


// Escuchar peticiones en el puerto 3000 (puede ser cualquier puerto)
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', 'Online');
});