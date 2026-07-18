import type {
    Actividad,
  } from '../types/actividad'
  
  import {
    actividadesInicialesEDO,
  } from '../data/actividadesIniciales'
  
  // Clave utilizada cuando UniRuta solo tenía un curso.
  const CLAVE_ACTIVIDADES_ANTERIOR =
    'uniruta-actividades'
  
  function obtenerClaveActividades(
    cursoId: string,
  ) {
    return `uniruta-curso-${cursoId}-actividades`
  }
  
  function leerActividades(
    clave: string,
  ): Actividad[] | null {
    const contenido = localStorage.getItem(clave)
  
    if (!contenido) {
      return null
    }
  
    try {
      return JSON.parse(contenido) as Actividad[]
    } catch {
      localStorage.removeItem(clave)
      return null
    }
  }
  
  export function cargarActividadesCurso(
    cursoId: string,
  ): Actividad[] {
    const claveCurso =
      obtenerClaveActividades(cursoId)
  
    const actividadesGuardadas =
      leerActividades(claveCurso)
  
    if (actividadesGuardadas) {
      return actividadesGuardadas
    }
  
    // Migra la lista antigua únicamente hacia EDO.
    if (cursoId === 'edo-2026-1') {
      const actividadesAnteriores =
        leerActividades(
          CLAVE_ACTIVIDADES_ANTERIOR,
        )
  
      if (actividadesAnteriores) {
        guardarActividadesCurso(
          cursoId,
          actividadesAnteriores,
        )
  
        return actividadesAnteriores
      }
  
      return actividadesInicialesEDO
    }
  
    // Los cursos nuevos comienzan sin actividades.
    return []
  }
  
  export function guardarActividadesCurso(
    cursoId: string,
    actividades: Actividad[],
  ) {
    localStorage.setItem(
      obtenerClaveActividades(cursoId),
      JSON.stringify(actividades),
    )
  }