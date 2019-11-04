var express = require('express');
var bcrypt = require('bcryptjs'); // libreria para encriptar la contraseña
var app = express();

var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion')

// ===========================================
// Obtener todos los usuarios
// ===========================================

app.get('/', (req, res, next) => {

    // Usuario.find({}, (err, usuarios) => { Con los parametros asi devuelve todos los campos de los usuarios hasta el password
    Usuario.find({}, 'nombre email role img') // Se puede especificar los campos que se desea que se devuelvan
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
});

// ===========================================
// Verficar token - Se coloca en esta parte del codigo para que las funciones de arriba sean publicas y las que abajo esten controladas por la existencia y vigencia del token
// ===========================================
// app.use('/', (req, res, next) => { esta parte queda comentada por que se crea un middleware 'mdAutenticacion' que controla esta parte

//     var token = req.query.token; // se lee la variable 'token' que puede o no venir incluida en el url
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ // 401 Unauthorized
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 errors: err
//             });
//         }

//         next();
//     });

// });

// ===========================================
// Actualizar un nuevo usuario
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({ // 500 Internal Server Error
                ok: false,
                mensaje: 'Error al actualizar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({ // 400 Bad request
                ok: false,
                mensaje: 'El usuario con el id:' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al grabar los nuevos datos al usuario el usuario',
                    errors: err
                });
            }

            usuarioActualizado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado,
                usuarioToken: req.usuario
            });

        });
    });
});

// ===========================================
// Crear un nuevo usuario
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    })

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});

// ===========================================
// Borrar un nuevo usuario
// ===========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con ese ID',
                errors: { message: 'No existe el usuario con ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });

    });
});

module.exports = app;