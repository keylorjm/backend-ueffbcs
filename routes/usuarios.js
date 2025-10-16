const express = require('express');
const router = express.Router();
// Asumo que tienes un middleware para validar campos, aunque no lo uses aquí.
const { validarCampos } = require('../middleware/validar-campos'); 
const { authMiddleware, checkRole } = require('../middleware/authMiddleware'); 
const { 
    getUsuarios,
    getUsuario,
    // 🛑 Necesitas crear o usar una función que filtre por rol en el controlador
    getUsuariosPorRolProfesor, 
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/controladorUsuario'); 


router.get(
    '/profesores', 
    [authMiddleware, checkRole(['admin', 'profesor']), validarCampos], 
    getUsuariosPorRolProfesor 
);


// /api/usuarios (Rutas generales de listado y creación)
router.route('/') 
 .get(authMiddleware, checkRole(['admin', 'profesor']), getUsuarios) 
 .post(authMiddleware, checkRole(['admin']), crearUsuario); // C: Crear

// /api/usuarios/:id (Rutas específicas por ID)
router.route('/:id')
.get(authMiddleware, checkRole(['admin']), getUsuario) // R: Leer Uno
.put(authMiddleware, checkRole(['admin']), actualizarUsuario) // U: Actualizar
.delete(authMiddleware, checkRole(['admin']), eliminarUsuario); // D: Eliminar

module.exports = router;