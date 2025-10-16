// models/Calificacion.js
const mongoose = require('mongoose');

function calcularPromedioTrimestral(trimestre) {
    if (!trimestre) return;
    const { 
        actividadesIndividuales, actividadesGrupales, 
        proyectoIntegrador, evaluacionPeriodo 
    } = trimestre;
    
    if ([actividadesIndividuales, actividadesGrupales, proyectoIntegrador, evaluacionPeriodo].every(v => v === 0)) {
        trimestre.promedioTrimestral = 0;
        return;
    }

    const promedioBruto = (
        actividadesIndividuales + actividadesGrupales + 
        proyectoIntegrador + evaluacionPeriodo
    ) / 4;
    
    trimestre.promedioTrimestral = Math.round(promedioBruto * 100) / 100;
}

const EsquemaNotaTrimestre = new mongoose.Schema({
    actividadesIndividuales: { type: Number, min: 0, max: 10, default: 0 },   
    actividadesGrupales: { type: Number, min: 0, max: 10, default: 0 },        
    proyectoIntegrador: { type: Number, min: 0, max: 10, default: 0 },          
    evaluacionPeriodo: { type: Number, min: 0, max: 10, default: 0 },         
    promedioTrimestral: { type: Number, min: 0, max: 10, default: 0 }, 
    
    // Faltas y Cualitativa
    faltasJustificadas: { type: Number, min: 0, default: 0 },
    faltasInjustificadas: { type: Number, min: 0, default: 0 },
    calificacionCualitativa: { type: String, default: '' }, 
});

const EsquemaCalificacion = new mongoose.Schema({
    estudiante: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante', required: true },
    curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
    anioLectivo: { type: mongoose.Schema.Types.ObjectId, ref: 'AnioLectivo', required: true },
    
    T1: { type: EsquemaNotaTrimestre, default: () => ({}) },
    T2: { type: EsquemaNotaTrimestre, default: () => ({}) },
    T3: { type: EsquemaNotaTrimestre, default: () => ({}) },

    evaluacionFinal: { type: Number, min: 0, max: 10, default: 0 }, 
    promedioTrimestralAnual: { type: Number, min: 0, max: 10, default: 0 },
    notaPromocion: { type: Number, min: 0, max: 10, default: 0 }           
}, { timestamps: true });

// Middleware de Cálculo PONDERADO (90/10)
EsquemaCalificacion.pre('save', function(next) {
    calcularPromedioTrimestral(this.T1);
    calcularPromedioTrimestral(this.T2);
    calcularPromedioTrimestral(this.T3);

    const promedios = [this.T1.promedioTrimestral, this.T2.promedioTrimestral, this.T3.promedioTrimestral].filter(p => p > 0);
    
    if (promedios.length > 0) {
        const suma = promedios.reduce((acc, val) => acc + val, 0);
        this.promedioTrimestralAnual = Math.round((suma / promedios.length) * 100) / 100;
    } else {
        this.promedioTrimestralAnual = 0;
    }

    if (this.promedioTrimestralAnual > 0 && this.evaluacionFinal > 0) {
        const notaPromocion = 
            (this.promedioTrimestralAnual * 0.90) + 
            (this.evaluacionFinal * 0.10);
        this.notaPromocion = Math.round(notaPromocion * 100) / 100;
    } else {
        this.notaPromocion = 0; 
    }

    next();
});

module.exports = mongoose.model('Calificacion', EsquemaCalificacion);