var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ================================================
// Busqueda por coleccion 
// ================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // se crea una expresion regular para reemplazar el /busqueda/i en los parametros de la busqueda
    // y poder usar 'busqueda' como variable y no como palabra
    var promesa;

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Solo se aceptan las colecciones usuarios, medicos y hospitales',
                error: { mensaje: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // [tabla] coloca el valor de la variable 'tabla' como propiedad del objeto: usuarios, hospitales o medicos
        });
    });
});


// ================================================
// Busqueda general
// ================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // se crea una expresion regular para reemplazar el /busqueda/i en los parametros de la busqueda
    // y poder usar 'busqueda' como variable y no como palabra

    // se deshabilita esta llamada a la promesa por que se optimiza para hacer las llamadas de manera simultanea
    // buscarHospitales(busqueda, regex)
    //     .then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales: hospitales
    //         });
    //     });

    Promise.all([ // con esta funcion se pueden llamar varias promesas de manera simultanea dentro de un arreglo
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => { // las respuestas de igual manera se obtienen dentro de un arreglo
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales: ', err);
                } else {
                    resolve(hospitales);
                }
            });
    })

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos: ', err);
                } else {
                    resolve(medicos);
                }
            });
    })

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or({ 'nombre': regex }, { 'email': regex })
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios: ', err);
                } else {
                    resolve(usuarios);
                }
            });
    })

}

module.exports = app;