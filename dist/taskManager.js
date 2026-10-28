"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.esTareaValida = esTareaValida;
exports.cargarTareas = cargarTareas;
exports.guardarTareas = guardarTareas;
exports.agregarTarea = agregarTarea;
exports.editarTarea = editarTarea;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const RUTA_ARCHIVO = path.join(__dirname, '../tasks.json');
function validarFecha(fechaStr) {
    if (fechaStr === null)
        return true;
    const timestamp = Date.parse(fechaStr);
    return !isNaN(timestamp);
}
function esTareaValida(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj))
        return false;
    if (typeof obj.titulo !== 'string' || obj.titulo.trim() === '')
        return false;
    if (obj.descripcion !== null && typeof obj.descripcion !== 'string')
        return false;
    const estadosValidos = ['PENDING', 'IN-PROGRESS', 'FINISHED', 'CANCELED'];
    if (!estadosValidos.includes(obj.estado))
        return false;
    if (typeof obj.creacion !== 'string' || !validarFecha(obj.creacion))
        return false;
    if (!validarFecha(obj.ultimaEdicion))
        return false;
    if (!validarFecha(obj.vencimiento))
        return false;
    const dificultadesValidas = [1, 2, 3];
    if (!dificultadesValidas.includes(obj.dificultad))
        return false;
    return true;
}
function cargarTareas() {
    try {
        if (!fs.existsSync(RUTA_ARCHIVO)) {
            console.warn(`[Aviso] El archivo ${RUTA_ARCHIVO} no existe. Se inicia con lista vacía.`);
            return [];
        }
        const contenidoRaw = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
        const datosParseados = JSON.parse(contenidoRaw);
        if (!Array.isArray(datosParseados)) {
            throw new Error('El JSON raíz debe ser un array.');
        }
        const tareasValidas = [];
        let descartadas = 0;
        for (const item of datosParseados) {
            if (esTareaValida(item)) {
                tareasValidas.push(item);
            }
            else {
                descartadas++;
            }
        }
        console.log(`[Resumen] Se cargaron ${tareasValidas.length} tareas válidas.`);
        if (descartadas > 0) {
            console.warn(`[Aviso] Se omitieron ${descartadas} tareas inválidas.`);
        }
        return tareasValidas;
    }
    catch (error) {
        console.error(`[Error al leer archivo]: ${error.message}`);
        return [];
    }
}
function guardarTareas(tareas) {
    try {
        const jsonString = JSON.stringify(tareas, null, 2);
        fs.writeFileSync(RUTA_ARCHIVO, jsonString, 'utf-8');
        console.log('[Éxito] Archivo tasks.json guardado correctamente.');
        return true;
    }
    catch (error) {
        console.error(`[Error al guardar archivo]: ${error.message}`);
        return false;
    }
}
function agregarTarea(tareas, nueva) {
    const tareaCompleta = {
        titulo: nueva.titulo.trim(),
        descripcion: nueva.descripcion !== undefined ? nueva.descripcion : null,
        estado: nueva.estado,
        creacion: new Date().toISOString(),
        ultimaEdicion: null,
        vencimiento: nueva.vencimiento !== undefined ? nueva.vencimiento : null,
        dificultad: nueva.dificultad,
    };
    if (!esTareaValida(tareaCompleta)) {
        console.error('[Error] Los datos de la tarea a agregar son inválidos.');
        return false;
    }
    tareas.push(tareaCompleta);
    return guardarTareas(tareas);
}
function editarTarea(tareas, indice, cambios) {
    if (indice < 0 || indice >= tareas.length) {
        console.error(`[Error] Índice inválido: ${indice}`);
        return false;
    }
    const actual = tareas[indice];
    const editada = {
        ...actual,
        ...cambios,
        titulo: cambios.titulo !== undefined ? cambios.titulo.trim() : actual.titulo,
        descripcion: cambios.descripcion !== undefined ? cambios.descripcion : actual.descripcion,
        vencimiento: cambios.vencimiento !== undefined ? cambios.vencimiento : actual.vencimiento,
        ultimaEdicion: new Date().toISOString(),
    };
    if (!esTareaValida(editada)) {
        console.error('[Error] La edición contiene campos inválidos.');
        return false;
    }
    tareas[indice] = editada;
    return guardarTareas(tareas);
}
