// routes/anioLectivo.js
const express = require('express');
const { 
    crearAnioLectivo, 
    obtenerAniosLectivos, 
    obtenerAnioLectivo, 
    actualizarAnioLectivo, 
    eliminarAnioLectivo 
} = require('../controllers/controladorAnioLectivo');
const { proteger, autorizar } = require('../middleware/autenticacion');
const router = express.Router();

router.use(proteger);

router.route('/')
    .post(autorizar('admin'), crearAnioLectivo)
    .get(obtenerAniosLectivos);

router.route('/:id')
    .get(obtenerAnioLectivo)
    .put(autorizar('admin'), actualizarAnioLectivo)
    .delete(autorizar('admin'), eliminarAnioLectivo);

module.exports = router;