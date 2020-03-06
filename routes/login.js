var express = require('express');
var bcrypt = require('bcryptjs'); // libreria para encriptar la contraseña
var jwt = require('jsonwebtoken'); // libreria para encriptar la contraseña

var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED; // jala la constante SEED definida en el archivo global 'config'

var mdAutenticacion = require('../middlewares/autenticacion');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID; // jala la constante CLIENT_ID definida en el archivo global 'config'
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ===========================================
// Renovacion de Token
// ===========================================
app.get( '/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

  // si logra posar por el middleware mdAutenticacion entonces entrará hasta acá y podemos renovar el Token
  var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas

  return res.status(200).json({
      ok: true,
      token: token,
      usuario: req.usuario
  });

});

// ===========================================
// Login de usuario (Google)
// ===========================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub']; se deshabilita para trabajar directamente con la informacion del payload
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: e,
                token: token
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (usuarioBD) {

            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar autenticacion normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id,
                    menu: obtenerMenu( usuarioBD.role)
                });

            }
        } else {
            // El usuario no existe, debemos crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id,
                    menu: obtenerMenu( usuarioBD.role )
                });

            });
        }
    });

});

// ===========================================
// Login de usuario (normal)
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
            id: usuarioBD.id,
            menu: obtenerMenu( usuarioBD.role )
        });
    });
});

function obtenerMenu( ROLE ){

  var menu = [
   {
     titulo: 'Principal',
     icono: 'mdi mdi-gauge',
     submenu: [
      { titulo: 'Dasboard', url: '/dashboard'},
      { titulo: 'ProgressBar', url: '/progress'},
      { titulo: 'Gráficas', url: '/graficas1'},
      { titulo: 'Promesas', url: '/promesas'},
      { titulo: 'Rxjs Componente', url: '/rxjs'}
     ]
   },
   {
     titulo: 'Mantenimiento',
     icono: 'mdi mdi-folder-lock-open',
     submenu: [
      // { titulo: 'Usuarios', url: '/usuarios'},
      { titulo: 'Médicos', url: '/medicos'},
      { titulo: 'Hospitales', url: '/hospitales'}
     ]
   }
 ];

 if ( ROLE === 'ADMIN_ROLE'){

   menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios'});

 }

 return menu;

}
module.exports = app;
