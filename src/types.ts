export type EstadoTarea = 'PENDING' | 'IN-PROGRESS' | 'FINISHED' | 'CANCELED';
export type DificultadTarea = 1 | 2 | 3;

export interface Tarea {
  titulo: string;
  descripcion: string | null;
  estado: EstadoTarea;
  creacion: string;
  ultimaEdicion: string | null;
  vencimiento: string | null;
  dificultad: DificultadTarea;
}