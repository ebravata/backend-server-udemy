var jwt = require('jsonwebtoken'); // libreria para encriptar la contraseña
var SEED = require('../config/config').SEED; // jala la constante SEED definida en el archivo global 'config'

// ================================================
//   Verifica token
// ================================================

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


// ================================================
//   Verifica ADMIN_ROLE o mismo usuario
// ================================================

exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id){

      next();
      return;

    } else {

      return res.status(401).json({ // 401 Unauthorized
          ok: false,
          mensaje: 'Token incorrecto - No es un administrador',
          errors: { message: 'Se requiere ser Administrador para realizar esta acción'}
      });
    }
}
