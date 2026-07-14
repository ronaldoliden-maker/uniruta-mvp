// Tipos de operaciones que puede realizar el motor de notas
export type TipoCalculo =
  | 'nota_directa'
  | 'promedio'
  | 'suma'
  | 'ponderado'

// Reglas de redondeo disponibles
export type ReglaRedondeo =
  | 'ninguno'
  | 'entero'

// Componente individual o agrupado del sistema de evaluación
export type ComponenteNota = {
  id: string
  nombre: string
  tipo: TipoCalculo
  peso?: number
  notaMaxima?: number
  redondeo?: ReglaRedondeo
  hijos?: ComponenteNota[]
}

// Configuración académica completa de un curso
export type ConfiguracionCurso = {
  id: string
  nombre: string
  ciclo: string
  notaMinima: number
  notaMaxima: number
  componentes: ComponenteNota[]
}

// Estados posibles de un curso dentro de UniRuta
export type EstadoCurso =
  | 'en_curso'
  | 'completado'
  | 'archivado'

// Curso completo registrado en la aplicación
export type Curso = ConfiguracionCurso & {
  codigo?: string
  estado: EstadoCurso
}