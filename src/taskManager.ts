import * as fs from 'fs';
import * as path from 'path';
import { Tarea, EstadoTarea, DificultadTarea } from './types';

const RUTA_ARCHIVO = path.join(__dirname, '../tasks.json');

function validarFecha(fechaStr: string | null): boolean {
  if (fechaStr === null) return true;
  const timestamp = Date.parse(fechaStr);
  return !isNaN(timestamp);
}

export function esTareaValida(obj: any): obj is Tarea {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (typeof obj.titulo !== 'string' || obj.titulo.trim() === '') return false;
  if (obj.descripcion !== null && typeof obj.descripcion !== 'string') return false;

  const estadosValidos: EstadoTarea[] = ['PENDING', 'IN-PROGRESS', 'FINISHED', 'CANCELED'];
  if (!estadosValidos.includes(obj.estado)) return false;

  if (typeof obj.creacion !== 'string' || !validarFecha(obj.creacion)) return false;
  if (!validarFecha(obj.ultimaEdicion)) return false;
  if (!validarFecha(obj.vencimiento)) return false;

  const dificultadesValidas: DificultadTarea[] = [1, 2, 3];
  if (!dificultadesValidas.includes(obj.dificultad)) return false;

  return true;
}

export function cargarTareas(): Tarea[] {
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

    const tareasValidas: Tarea[] = [];
    let descartadas = 0;

    for (const item of datosParseados) {
      if (esTareaValida(item)) {
        tareasValidas.push(item);
      } else {
        descartadas++;
      }
    }

    console.log(`[Resumen] Se cargaron ${tareasValidas.length} tareas válidas.`);
    if (descartadas > 0) {
      console.warn(`[Aviso] Se omitieron ${descartadas} tareas inválidas.`);
    }

    return tareasValidas;
  } catch (error: any) {
    console.error(`[Error al leer archivo]: ${error.message}`);
    return [];
  }
}

export function guardarTareas(tareas: Tarea[]): boolean {
  try {
    const jsonString = JSON.stringify(tareas, null, 2);
    fs.writeFileSync(RUTA_ARCHIVO, jsonString, 'utf-8');
    console.log('[Éxito] Archivo tasks.json guardado correctamente.');
    return true;
  } catch (error: any) {
    console.error(`[Error al guardar archivo]: ${error.message}`);
    return false;
  }
}

export function agregarTarea(tareas: Tarea[], nueva: Omit<Tarea, 'creacion' | 'ultimaEdicion'>): boolean {
  const tareaCompleta: Tarea = {
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

export function editarTarea(tareas: Tarea[], indice: number, cambios: Partial<Omit<Tarea, 'creacion'>>): boolean {
  if (indice < 0 || indice >= tareas.length) {
    console.error(`[Error] Índice inválido: ${indice}`);
    return false;
  }

  const actual = tareas[indice];
  const editada: Tarea = {
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