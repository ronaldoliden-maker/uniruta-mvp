export type EstadoTema = "Pendiente" | "En progreso" | "Completado";

export type TemaCurso = {
  id: number;
  semana: number;
  titulo: string;
  detalle: string;
  estado: EstadoTema;
};