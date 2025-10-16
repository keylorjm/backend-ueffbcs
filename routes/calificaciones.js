// routes/calificaciones.js
const express = require('express');
const { 
    actualizarCalificacion, 
    generarReporte 
} = require('../controllers/controladorCalificacion');
const { proteger, autorizar } = require('../middleware/autenticacion');

const router = express.Router();

router.use(proteger);

// RUTA CLAVE: Ingresar notas detalladas (PUT para actualizar o crear)
router.put('/', autorizar('admin', 'profesor'), actualizarCalificacion);

// RUTA CLAVE: Generar Reporte PDF (T1, T2, T3, FINAL)
router.get('/reporte/:estudianteId/:cursoId/:tipoReporte', autorizar('admin', 'profesor'), generarReporte);

module.exports = router;