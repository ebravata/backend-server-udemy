var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var uniqueValidator = require('mongoose-unique-validator'); // Plugin para maquillar el mensaje de validacion de la propiedad 'unique: true'

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El	nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' }); // collection: 'hospitales' para evitar que mongoose coloque el nombre a la coleccion como 'hospitals'

module.exports = mongoose.model('Hospital', hospitalSchema);