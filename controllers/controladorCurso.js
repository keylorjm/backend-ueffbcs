// controllers/curso.controller.js
const { response } = require('express');
const mongoose = require('mongoose');
const Curso = require('../models/Curso');
const ErrorResponse = require('../utils/errorResponse');

// ================================
// GET /api/cursos/:id  (con populate)
// ================================
const getOneById = async (req, res = response, next) => {
  const { id } = req.params;

  try {
    // Validación temprana de ObjectId (evita CastError feos)
    if (!mongoose.isValidObjectId(id)) {
      return next(new ErrorResponse(`ID inválido: ${id}`, 400));
    }

    // Populate de referencias -> devuelve objetos completos
    const curso = await Curso.findById(id)
      .populate({ path: 'profesorTutor', select: 'nombre apellido correo' })
      .populate({ path: 'materias', select: 'nombre descripcion' })
      .populate({ path: 'estudiantes', select: 'nombre apellido uid' })
      .lean({ virtuals: true }); // objetos planos (mejor para Angular)

    if (!curso) {
      return next(new ErrorResponse(`No se encontró curso con el ID ${id}`, 404));
    }

    // Mantén la forma que espera tu Angular service
    return res.status(200).json({ ok: true, curso });
  } catch (error) {
    console.error('Error al obtener curso por ID:', error);
    return next(error);
  }
};

// ================================
// GET /api/cursos
// ================================
const getAllCursos = async (req, res = response, next) => {
  try {
    const cursos = await Curso.find()
      .populate({ path: 'profesorTutor', select: 'nombre apellido' })
      .sort({ nombre: 1 })
      .lean({ virtuals: true });

    return res.status(200).json({ ok: true, cursos });
  } catch (err) {
    return next(err);
  }
};

// ================================
// POST /api/cursos
// ================================
const createCurso = async (req, res = response, next) => {
  try {
    const curso = await Curso.create(req.body);
    return res.status(201).json({ ok: true, curso });
  } catch (err) {
    return next(err);
  }
};

// ================================
// PUT /api/cursos/:id
// ================================
const updateCurso = async (req, res = response, next) => {
  try {
    const curso = await Curso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({ path: 'profesorTutor', select: 'nombre apellido correo' })
      .populate({ path: 'materias', select: 'nombre descripcion' })
      .populate({ path: 'estudiantes', select: 'nombre apellido uid' })
      .lean({ virtuals: true });

    if (!curso) {
      return next(new ErrorResponse(`No se encontró curso con ID ${req.params.id}`, 404));
    }

    return res.status(200).json({ ok: true, curso });
  } catch (err) {
    return next(err);
  }
};

// ================================
// DELETE /api/cursos/:id
// ================================
const deleteCurso = async (req, res = response, next) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id).lean();
    if (!curso) {
      return next(new ErrorResponse(`No se encontró curso con ID ${req.params.id}`, 404));
    }
    return res.status(200).json({ ok: true, data: {} });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllCursos,
  getOneById,
  createCurso,
  updateCurso,
  deleteCurso,
};
