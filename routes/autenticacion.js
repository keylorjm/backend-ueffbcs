// routes/autenticacion.js
const express = require('express');
const { 
    iniciarSesion, 
    registrarUsuario, 
    recuperarContrasena, 
    restablecerContrasena // ⬅️ Importar la nueva función
} = require('../controllers/controladorAutenticacion');
const router = express.Router();

router.post('/registrar', registrarUsuario); 
router.post('/iniciarSesion', iniciarSesion);

// Rutas de recuperación
router.post('/recuperarContrasena', recuperarContrasena); 
router.put('/restablecerContrasena/:resetToken', restablecerContrasena); // ⬅️ NUEVA RUTA IMPLEMENTADA

module.exports = router;