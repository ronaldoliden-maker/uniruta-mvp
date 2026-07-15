import { cursosIniciales } from '../data/cursos'
import type { Curso } from '../types/academico'

const CLAVE_CURSOS_REGISTRADOS =
  'uniruta-cursos-registrados'

// Recupera la lista guardada.
// Si todavía no existe, utiliza los cursos iniciales.
export function cargarCursosRegistrados(): Curso[] {
  const contenido = localStorage.getItem(
    CLAVE_CURSOS_REGISTRADOS,
  )

  if (!contenido) {
    return [...cursosIniciales]
  }

  try {
    const cursos = JSON.parse(contenido) as Curso[]

    if (!Array.isArray(cursos) || cursos.length === 0) {
      return [...cursosIniciales]
    }

    return cursos
  } catch {
    localStorage.removeItem(
      CLAVE_CURSOS_REGISTRADOS,
    )

    return [...cursosIniciales]
  }
}

// Guarda todos los cursos registrados por el estudiante.
export function guardarCursosRegistrados(
  cursos: Curso[],
) {
  localStorage.setItem(
    CLAVE_CURSOS_REGISTRADOS,
    JSON.stringify(cursos),
  )
}