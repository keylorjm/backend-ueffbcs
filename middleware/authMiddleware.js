// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); 
const asyncHandler = require('./asyncHandler'); // Asumimos que está en ./

// Middleware principal para verificar el JWT
exports.authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Obtener el token del encabezado
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 

    // 2. Verificar que el token exista (Si no hay token)
    if (!token) {
        return res.status(401).json({
            success: false, 
            error: 'No autorizado para acceder a esta ruta. No hay token.'
        });
    }

    try {
        // 3. Verificar el token y obtener el ID del payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Buscar el usuario y adjuntarlo a req.usuario
        // Importante: .select('-clave') no es necesario aquí, ya que el modelo lo hace por defecto,
        // pero buscamos el usuario sin su clave hasheada
        req.usuario = await Usuario.findById(decoded.id); 

        if (!req.usuario) {
            return res.status(401).json({ success: false, error: 'Token válido, pero el usuario no existe.' });
        }
        
        next();

    } catch (err) {
        // 4. Capturar errores de jwt.verify (expirado, inválido por JWT_SECRET)
        return res.status(401).json({
            success: false, 
            error: 'Token expirado o inválido.' // Mensaje que captura tu frontend
        });
    }
});

// Middleware para verificar el rol del usuario
exports.checkRole = (roles) => (req, res, next) => {
    // Si el usuario no está en la lista de roles permitidos, lanza 403 Forbidden
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
        return res.status(403).json({ 
            success: false, 
            error: `Acceso denegado. Rol (${req.usuario?.rol || 'No logueado'}) sin permisos.` 
        });
    }
    next();
};