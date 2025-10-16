// models/AnioLectivo.js
const mongoose = require('mongoose');

const EsquemaAnioLectivo = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    esActual: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('AnioLectivo', EsquemaAnioLectivo);