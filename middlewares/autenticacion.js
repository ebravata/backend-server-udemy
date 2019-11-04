var jwt = require('jsonwebtoken'); // libreria para encriptar la contraseña
var SEED = require('../config/config').SEED; // jala la constante SEED definida en el archivo global 'config'

exports.verificaToken = function(req, res, next) {

    var token = req.query.token; // se lee la variable 'token' que puede o no venir incluida en el url
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({ // 401 Unauthorized
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario; // el decoded contiene informacion del usuario que logueo
        next();
    });
}