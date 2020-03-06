var express = require('express');
var app = express();
var bcrypt = require('bcryptjs'); // libreria para encriptar la contraseña

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion')

// ===========================================
// Obtener todos los hospitales
// ===========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var limit = 5;
    desde = Number(desde);

    if (desde === 0){
      limit = 0
    }

    Hospital.find({}) // Se puede especificar los campos que se desea que se devuelvan
        .skip(desde)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.countDocuments({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                })
            });
});



// ===========================================
// Actualizar un hospital
// ===========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({ // 500 Internal Server Error
                ok: false,
                mensaje: 'Error al actualizar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({ // 400 Bad request
                ok: false,
                mensaje: 'El hospital con el id:' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al grabar los nuevos datos al hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado,
                usuarioToken: req.usuario
            });

        });
    });
});

// ===========================================
// Crear un nuevo hospital
// ===========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
        img: body.img
    })

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });

    });


});

// ===========================================
// Borrar un nuevo hospital
// ===========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con ese ID',
                errors: { message: 'No existe el hospital con ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado,
            usuarioToken: req.usuario
        });

    });
});

// ===========================================
// Obtener un hospital mediante su id
// ===========================================

app.get('/:id', (req, res) => {

  var id = req.params.id;

  Hospital.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      }

      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital con el id ' + id + 'no existe',
          errors: {
            message: 'No existe un hospital ese ID'
          }
        });

      }

      res.status(200).json({
        ok: true,
        hospital: hospital
      });
    })
  })


module.exports = app;
