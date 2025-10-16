// controllers/controladorCalificacion.js
const Calificacion = require('../models/Calificacion');
const Curso = require('../models/Curso');
const pdf = require('html-pdf'); // Asegúrate de tener instalado html-pdf

// @desc    Crear/Actualizar calificaciones (C/U)
// @route   PUT /api/calificaciones
// @access  Private/Admin, Profesor
exports.actualizarCalificacion = async (req, res) => {
    const { 
        estudianteId, cursoId, anioLectivoId, trimestre, notas     
    } = req.body;
    
    const tiposValidos = ['T1', 'T2', 'T3', 'FINAL_EXAM'];

    if (!tiposValidos.includes(trimestre)) {
        return res.status(400).json({ success: false, error: 'Tipo de ingreso inválido. Use T1, T2, T3 o FINAL_EXAM.' });
    }
    
    // Verificación de permisos del profesor
    if (req.usuario.rol === 'profesor') {
        const curso = await Curso.findById(cursoId);
        if (!curso || curso.profesor.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({ success: false, error: 'No tiene permiso para calificar en este curso.' });
        }
    }

    try {
        let updateFields = {};

        if (['T1', 'T2', 'T3'].includes(trimestre)) {
            // Campos trimestrales: Notas (4), Faltas (2) y Cualitativa (1)
            updateFields = { 
                [`${trimestre}.actividadesIndividuales`]: notas.actividadesIndividuales,
                [`${trimestre}.actividadesGrupales`]: notas.actividadesGrupales,
                [`${trimestre}.proyectoIntegrador`]: notas.proyectoIntegrador,
                [`${trimestre}.evaluacionPeriodo`]: notas.evaluacionPeriodo,
                [`${trimestre}.faltasJustificadas`]: notas.faltasJustificadas,
                [`${trimestre}.faltasInjustificadas`]: notas.faltasInjustificadas,
                [`${trimestre}.calificacionCualitativa`]: notas.calificacionCualitativa,
            };
        } else if (trimestre === 'FINAL_EXAM') {
            // Campo de Evaluación Final (10%)
            updateFields = { 
                evaluacionFinal: notas.evaluacionFinal 
            };
        }

        let calificacion = await Calificacion.findOneAndUpdate(
            { estudiante: estudianteId, curso: cursoId, anioLectivo: anioLectivoId },
            { $set: updateFields },
            // new: true retorna el doc actualizado, upsert: true crea si no existe
            { new: true, upsert: true, runValidators: true } 
        );

        if (calificacion) {
             calificacion = await calificacion.save(); // Fuerza la ejecución del middleware de cálculo 90/10
        }

        res.status(200).json({ 
            success: true, 
            mensaje: `Calificación de ${trimestre} ingresada y promedios actualizados.`, 
            datos: calificacion 
        });

    } catch (error) {
        res.status(400).json({ success: false, error: 'Error al actualizar calificación: ' + error.message });
    }
};

// @desc    Obtener una calificación específica (R)
// @route   GET /api/calificaciones/:estudianteId/:cursoId/:anioLectivoId
// @access  Private/Admin, Profesor
exports.obtenerCalificacion = async (req, res) => {
    try {
        const { estudianteId, cursoId, anioLectivoId } = req.params;
        const calificacion = await Calificacion.findOne({
            estudiante: estudianteId, curso: cursoId, anioLectivo: anioLectivoId
        })
        .populate('estudiante', 'nombre codigo')
        .populate('curso', 'nombre gradoNivel');

        if (!calificacion) { 
            return res.status(404).json({ success: false, error: 'Calificación no encontrada.' }); 
        }

        res.status(200).json({ success: true, datos: calificacion });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener la calificación.' });
    }
};

// @desc    Eliminar una calificación (D)
// @route   DELETE /api/calificaciones/:calificacionId
// @access  Private/Admin, Profesor
exports.eliminarCalificacion = async (req, res) => {
    try {
        const calificacion = await Calificacion.findById(req.params.calificacionId);
        if (!calificacion) { 
            return res.status(404).json({ success: false, error: 'Calificación no encontrada.' }); 
        }
        
        // Verificación de permisos del profesor (puede mejorar la seguridad)
        if (req.usuario.rol === 'profesor') {
            const curso = await Curso.findById(calificacion.curso);
            if (!curso || curso.profesor.toString() !== req.usuario.id.toString()) {
                return res.status(403).json({ success: false, error: 'No tiene permiso para eliminar esta calificación.' });
            }
        }

        await calificacion.deleteOne(); 
        res.status(200).json({ success: true, mensaje: 'Calificación eliminada con éxito.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar calificación.' });
    }
};

// @desc    Generar reporte individual de notas en PDF
// @route   GET /api/calificaciones/reporte/:estudianteId/:cursoId/:tipoReporte
// @access  Private/Admin, Profesor
exports.generarReporte = async (req, res) => {
    // Implementación detallada de reporte individual (omito por brevedad, pero debe basarse en el HTML)
    res.status(501).json({ success: false, error: 'Implementación de Reporte Individual Pendiente.' });
};

// @desc    Generar reporte masivo de notas de un trimestre para un curso
// @route   GET /api/calificaciones/reporte/masivo/:cursoId/:trimestre
// @access  Private/Admin, Profesor
exports.generarReporteMasivoTrimestral = async (req, res) => {
    try {
        const { cursoId, trimestre } = req.params; 
        const trimestreClave = trimestre.toUpperCase();
        
        if (!['T1', 'T2', 'T3'].includes(trimestreClave)) {
            return res.status(400).json({ success: false, error: 'Trimestre inválido. Use T1, T2 o T3.' });
        }

        // 1. Obtener los datos del curso y todas las calificaciones
        const curso = await Curso.findById(cursoId).populate('profesor', 'nombre');
        
        if (!curso) { return res.status(404).json({ success: false, error: 'Curso no encontrado.' }); }

        const calificaciones = await Calificacion.find({ curso: cursoId })
            .populate('estudiante', 'nombre codigo') 
            .sort('estudiante.nombre'); 

        if (calificaciones.length === 0) { return res.status(404).json({ success: false, error: 'No hay calificaciones registradas para este curso.' }); }

        // 2. Construir la tabla HTML
        let filasTabla = '';
        calificaciones.forEach((cal, index) => {
            const dataTrimestre = cal[trimestreClave];
            
            // Usar '0.00' o 'N/A' si los datos no existen o son cero
            const ai = dataTrimestre?.actividadesIndividuales?.toFixed(2) ?? '0.00';
            const ag = dataTrimestre?.actividadesGrupales?.toFixed(2) ?? '0.00';
            const pi = dataTrimestre?.proyectoIntegrador?.toFixed(2) ?? '0.00';
            const ep = dataTrimestre?.evaluacionPeriodo?.toFixed(2) ?? '0.00';
            const prom = dataTrimestre?.promedioTrimestral?.toFixed(2) ?? '0.00';
            
            const faltasJ = dataTrimestre?.faltasJustificadas ?? 0;
            const faltasI = dataTrimestre?.faltasInjustificadas ?? 0;
            const cualitativa = dataTrimestre?.calificacionCualitativa ?? 'N/A';

            filasTabla += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${cal.estudiante.nombre}</td>
                    <td class="nota">${ai}</td>
                    <td class="nota">${ag}</td>
                    <td class="nota">${pi}</td>
                    <td class="nota">${ep}</td>
                    <td class="promedio">${prom}</td>
                    <td>${faltasJ}</td>
                    <td>${faltasI}</td>
                    <td class="cualitativa">${cualitativa}</td>
                </tr>
            `;
        });

        // 3. Generación del HTML Completo para el PDF
        const htmlContenido = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10pt; }
                    h1, h2, h3 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid black; padding: 4px; text-align: left; }
                    th { background-color: #f2f2f2; font-size: 9pt; text-align: center; }
                    .nota, .promedio { text-align: center; font-weight: bold; }
                    .promedio { background-color: #e0f0ff; }
                    .header-info { margin-bottom: 20px; font-size: 11pt; }
                </style>
            </head>
            <body>
                <h1>UNIDAD EDUCATIVA "FRAY BARTOLOME DE LAS CASAS-SALASACA"</h1>
                <h2>REGISTRO DE CALIFICACIONES - ${trimestreClave}</h2>
                <div class="header-info">
                    <p><strong>Curso:</strong> ${curso.gradoNivel} - ${curso.nombre}</p>
                    <p><strong>Docente:</strong> ${curso.profesor.nombre}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th rowspan="2">Nº</th>
                            <th rowspan="2">NÓMINA DE ESTUDIANTES</th>
                            <th colspan="4">Componentes de Nota (40%)</th>
                            <th rowspan="2">Promedio Trimestral</th>
                            <th colspan="2">Faltas</th>
                            <th rowspan="2">Calificación Cualitativa</th>
                        </tr>
                        <tr>
                            <th>Act. Indiv.</th>
                            <th>Act. Grup.</th>
                            <th>Proy. Integr.</th>
                            <th>Eval. Periodo</th>
                            <th>Just.</th>
                            <th>Injust.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        // 4. Generar y enviar el PDF
        pdf.create(htmlContenido, { format: 'Letter', orientation: 'landscape' }).toStream((err, stream) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al generar el PDF masivo.' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Reporte_Masivo_${curso.gradoNivel}_${trimestreClave}.pdf"`);
            stream.pipe(res);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};