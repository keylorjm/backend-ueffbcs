// controllers/controladorAnioLectivo.js
const AnioLectivo = require('../models/AnioLectivo');

// @desc    Crear un nuevo año lectivo
// @route   POST /api/anioLectivo
// @access  Private/Admin
exports.crearAnioLectivo = async (req, res) => {
    try {
        const anioLectivo = await AnioLectivo.create(req.body);
        res.status(201).json({ success: true, datos: anioLectivo });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Obtener todos los años lectivos
// @route   GET /api/anioLectivo
// @access  Private
exports.obtenerAniosLectivos = async (req, res) => {
    try {
        const aniosLectivos = await AnioLectivo.find().sort({ fechaInicio: -1 }); // Más recientes primero
        res.status(200).json({ success: true, datos: aniosLectivos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener años lectivos.' });
    }
};

// @desc    Obtener un solo año lectivo
// @route   GET /api/anioLectivo/:id
// @access  Private
exports.obtenerAnioLectivo = async (req, res) => {
    try {
        const anioLectivo = await AnioLectivo.findById(req.params.id);
        if (!anioLectivo) { 
            return res.status(404).json({ success: false, error: 'Año Lectivo no encontrado.' }); 
        }
        res.status(200).json({ success: true, datos: anioLectivo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener el año lectivo.' });
    }
};

// @desc    Actualizar un año lectivo
// @route   PUT /api/anioLectivo/:id
// @access  Private/Admin
exports.actualizarAnioLectivo = async (req, res) => {
    try {
        const anioLectivo = await AnioLectivo.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!anioLectivo) { 
            return res.status(404).json({ success: false, error: 'Año Lectivo no encontrado.' }); 
        }
        res.status(200).json({ success: true, datos: anioLectivo });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Eliminar un año lectivo
// @route   DELETE /api/anioLectivo/:id
// @access  Private/Admin
exports.eliminarAnioLectivo = async (req, res) => {
    try {
        const anioLectivo = await AnioLectivo.findByIdAndDelete(req.params.id);
        if (!anioLectivo) { 
            return res.status(404).json({ success: false, error: 'Año Lectivo no encontrado.' }); 
        }
        // NOTA: Se debería añadir lógica para verificar que no esté asociado a cursos activos.
        res.status(200).json({ success: true, mensaje: 'Año Lectivo eliminado.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar año lectivo.' });
    }
};