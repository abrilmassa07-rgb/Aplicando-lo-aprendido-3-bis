import { cargarTareas, agregarTarea, editarTarea } from './taskManager';

function main() {
  console.log('--- Probando Carga de Tareas ---');
  const tareas = cargarTareas();

  console.log('\n--- Probando Agregar Tarea ---');
  agregarTarea(tareas, {
    titulo: 'Completar entrega TP Persistencia',
    descripcion: 'Validar y escribir en tasks.json',
    estado: 'IN-PROGRESS',
    vencimiento: '2026-11-15T23:59:00',
    dificultad: 2,
  });

  console.log('\n--- Probando Editar Tarea (Índice 0) ---');
  if (tareas.length > 0) {
    editarTarea(tareas, 0, {
      estado: 'FINISHED',
      descripcion: 'Algoritmos comparados y testeados con éxito.',
    });
  }
}

main();