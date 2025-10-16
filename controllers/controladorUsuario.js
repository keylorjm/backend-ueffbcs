const Usuario = require('../models/Usuario');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler'); 
const { request, response } = require('express'); // Importación necesaria para tipado

// -------------------------------------------------------------------
// 🛑 NUEVA FUNCIÓN: OBTENER SOLO PROFESORES
// @desc    Obtener usuarios por rol específico (Profesor)
// @route   GET /api/usuarios/profesores
// @access  Protegido (Admin, Profesor)
// -------------------------------------------------------------------
exports.getUsuariosPorRolProfesor = asyncHandler(async (req = request, res = response, next) => {
    // 🛑 CRÍTICO: Filtra por el rol 'profesor' y estado activo (si lo usas)
    const query = { rol: 'profesor' }; 
    
    // Si tu modelo usa un campo 'estado', inclúyelo en el filtro
    // const query = { rol: 'profesor', estado: true };

    const profesores = await Usuario.find(query)
        // Solo necesitamos el UID (que viene del toJSON), nombre, y correo
        .select('nombre correo'); 

    // 🛑 CRÍTICO: Devuelve la respuesta en el formato que espera el frontend (propiedad 'usuarios')
    res.status(200).json({
        ok: true, // Cambié 'success' por 'ok' para coincidir con tu otro código
        total: profesores.length,
        usuarios: profesores // Propiedad esperada por el frontend
    });
});

// -------------------------------------------------------------------
// @desc    Obtener todos los usuarios (CRUD existente)
// @route   GET /api/usuarios
// @access  Protegido (Admin, Profesor)
// -------------------------------------------------------------------
exports.getUsuarios = asyncHandler(async (req = request, res = response, next) => {
    const usuarios = await Usuario.find(); 
    
    // Adaptando el formato de respuesta para ser consistente con 'getUsuariosPorRolProfesor'
    res.status(200).json({
        ok: true,
        total: usuarios.length,
        usuarios: usuarios // Usamos 'usuarios' en lugar de 'data'
    });
});

// -------------------------------------------------------------------
// @desc    Obtener un solo usuario (CRUD existente)
// @route   GET /api/usuarios/:id
// @access  Protegido (Admin)
// -------------------------------------------------------------------
exports.getUsuario = asyncHandler(async (req, res, next) => {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
        return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        ok: true,
        usuario: usuario // Usamos 'usuario' en lugar de 'data'
    });
});

// -------------------------------------------------------------------
// @desc    Crear nuevo usuario (CRUD existente)
// @route   POST /api/usuarios
// @access  Protegido (Admin)
// -------------------------------------------------------------------
exports.crearUsuario = asyncHandler(async (req, res, next) => {
    const usuario = await Usuario.create(req.body); 

    res.status(201).json({
        ok: true,
        usuario: usuario // Usamos 'usuario' en lugar de 'data'
    });
});

// -------------------------------------------------------------------
// @desc    Actualizar un usuario (CRUD existente)
// @route   PUT /api/usuarios/:id
// @access  Protegido (Admin)
// -------------------------------------------------------------------
exports.actualizarUsuario = asyncHandler(async (req, res, next) => {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!usuario) {
        return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        ok: true,
        usuario: usuario // Usamos 'usuario' en lugar de 'data'
    });
});

// -------------------------------------------------------------------
// @desc    Eliminar un usuario (CRUD existente)
// @route   DELETE /api/usuarios/:id
// @access  Protegido (Admin)
// -------------------------------------------------------------------
exports.eliminarUsuario = asyncHandler(async (req, res, next) => {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
        return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        ok: true,
        msg: "Usuario eliminado correctamente"
    });
});