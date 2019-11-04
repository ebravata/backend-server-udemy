var express = require('express');
var bcrypt = require('bcryptjs'); // libreria para encriptar la contraseña
var jwt = require('jsonwebtoken'); // libreria para encriptar la contraseña

var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED; // jala la constante SEED definida en el archivo global 'config'

// ===========================================
// Login de usuario
// ===========================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear token!!
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id
        });
    });
});

module.exports = app;