// Requires *Importacion de librerias (terceros o personalizadas) que ocupamos para que funcione algo...
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();


// Conectar a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'Online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    })
});


// Escuchar peticiones en el puerto 3000 (puede ser cualquier puerto)
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', 'Online');
});