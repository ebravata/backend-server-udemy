var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Sólo se aceptan estos tipos de coleccion
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válido',
            errors: { mensaje: 'Los tipos de colecciones válidos son ' + tiposValidos.join(', ') }
        });
    }

    // Verificar si viene un archivo en la peticion
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningun archivo',
            errors: { mensaje: 'Debe seleccionar un archivo' }
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo se aceptan estas extensiones
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'jpg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { mensaje: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path especifico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario',
                    errors: { mensaje: 'No existe el usuario' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe ya una imagen, la borra para colocar la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => { return err; }); //unlink pide el callback
                // fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del usuario',
                        errors: err
                    });
                }

                usuarioActualizado.password = ':(';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });


            });
        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico',
                    errors: { mensaje: 'No existe el medico' }
                });
            }


            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe ya una imagen, la borra para colocar la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => { return err; }); //unlink pide el callback
                // fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del médico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });


            });
        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital',
                    errors: { mensaje: 'No existe el hospital' }
                });
            }

            console.log('imagen hospital:', hospital.img)
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe ya una imagen, la borra para colocar la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => { return err; }); //unlink pide el callback
                // fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });


            });
        });

    }
}

module.exports = app;
