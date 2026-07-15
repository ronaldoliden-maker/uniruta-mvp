import type { Curso } from '../types/academico'

import {
  obtenerEvaluacionesDirectas,
  type NotasPorId,
} from './calcularNotas'

// Claves antiguas usadas antes de soportar varios cursos.
// Se conservan temporalmente para no perder las notas de EDO.
const CLAVE_NOTAS_ANTERIOR =
  'uniruta-notas-automaticas'

const CLAVE_META_ANTERIOR =
  'uniruta-meta-nota'

function obtenerClaveNotas(cursoId: string) {
  return `uniruta-curso-${cursoId}-notas`
}

function obtenerClaveMeta(cursoId: string) {
  return `uniruta-curso-${cursoId}-meta`
}

function crearNotasVacias(
  curso: Curso,
): NotasPorId {
  const notas: NotasPorId = {}

  obtenerEvaluacionesDirectas(
    curso.componentes,
  ).forEach((evaluacion) => {
    notas[evaluacion.id] = ''
  })

  return notas
}

function leerNotasGuardadas(
  clave: string,
): NotasPorId | null {
  const contenido = localStorage.getItem(clave)

  if (!contenido) {
    return null
  }

  try {
    return JSON.parse(contenido) as NotasPorId
  } catch {
    localStorage.removeItem(clave)
    return null
  }
}

export function cargarNotasCurso(
  curso: Curso,
): NotasPorId {
  const notasVacias = crearNotasVacias(curso)

  const notasDelCurso = leerNotasGuardadas(
    obtenerClaveNotas(curso.id),
  )

  if (notasDelCurso) {
    return {
      ...notasVacias,
      ...notasDelCurso,
    }
  }

  // Recupera las notas antiguas solamente para EDO.
  if (curso.id === 'edo-2026-1') {
    const notasAnteriores = leerNotasGuardadas(
      CLAVE_NOTAS_ANTERIOR,
    )

    if (notasAnteriores) {
      return {
        ...notasVacias,
        ...notasAnteriores,
      }
    }

    // Compatibilidad con las primeras claves individuales.
    obtenerEvaluacionesDirectas(
      curso.componentes,
    ).forEach((evaluacion) => {
      notasVacias[evaluacion.id] =
        localStorage.getItem(
          `uniruta-nota-${evaluacion.id}`,
        ) ?? ''
    })
  }

  return notasVacias
}

export function guardarNotasCurso(
  cursoId: string,
  notas: NotasPorId,
) {
  localStorage.setItem(
    obtenerClaveNotas(cursoId),
    JSON.stringify(notas),
  )
}

export function cargarMetaCurso(
  curso: Curso,
) {
  const metaGuardada = localStorage.getItem(
    obtenerClaveMeta(curso.id),
  )

  if (metaGuardada !== null) {
    return metaGuardada
  }

  if (curso.id === 'edo-2026-1') {
    const metaAnterior =
      localStorage.getItem(CLAVE_META_ANTERIOR)

    if (metaAnterior !== null) {
      return metaAnterior
    }
  }

  return String(curso.notaMinima)
}

export function guardarMetaCurso(
  cursoId: string,
  meta: string,
) {
  localStorage.setItem(
    obtenerClaveMeta(cursoId),
    meta,
  )
}