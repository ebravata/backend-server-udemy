var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin para maquillar el mensaje de validacion de la propiedad 'unique: true'

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, required: [true, 'La contraseña es requerida'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: 'campo {PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);