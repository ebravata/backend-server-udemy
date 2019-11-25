var express = require('express');
var app = express();
var bcrypt = require('bcryptjs'); // libreria para encriptar la contraseña

var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion')

// ===========================================
// Obtener todos los medicos
// ===========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}) // Se puede especificar los campos que se desea que se devuelvan
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })
            });
});



// ===========================================
// Actualizar un medico
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({ // 500 Internal Server Error
                ok: false,
                mensaje: 'Error al actualizar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({ // 400 Bad request
                ok: false,
                mensaje: 'El medico con el id:' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al grabar los nuevos datos al medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado,
                usuarioToken: req.usuario
            });

        });
    });
});

// ===========================================
// Crear un nuevo medico
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id
    })

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });

    });


});

// ===========================================
// Borrar un nuevo medico
// ===========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con ese ID',
                errors: { message: 'No existe el medico con ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoBorrado,
            usuarioToken: req.usuario
        });

    });
});

module.exports = app;