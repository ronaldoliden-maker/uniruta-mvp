export type EstadoActividad =
  | 'No iniciada'
  | 'Completada'

export type Actividad = {
  id: number
  nombre: string
  tipo: string
  semana: string
  fecha: string
  estado: EstadoActividad
}