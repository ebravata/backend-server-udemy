var express = require('express');

var app = express();

var path = require('path');

var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var coleccionesValidas = ['usuarios', 'medicos', 'hospitales'];

    // Validar el tipo de coleccion

    if (coleccionesValidas.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no encontrada',
            errors: { mensaje: 'Sólo se aceptan las colecciones usuarios, medicos y hospitales' }
        });
    }

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img}`);
    var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        res.sendFile(pathNoImagen);
    }


});

module.exports = app;