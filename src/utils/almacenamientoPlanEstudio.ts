import type {
    ConfiguracionPlanEstudio,
    PlanEstudioGuardado,
  } from "../types/planEstudio";
  
  const configuracionInicial: ConfiguracionPlanEstudio = {
    horasSemanales: 6,
    duracionSesion: 60,
    diasDisponibles: [
      "Lunes",
      "Miércoles",
      "Viernes",
    ],
  };
  
  function obtenerClave(cursoId: string) {
    return `uniruta-curso-${cursoId}-plan-estudio`;
  }
  
  export function cargarPlanEstudio(
    cursoId: string,
  ): PlanEstudioGuardado {
    const guardado = localStorage.getItem(
      obtenerClave(cursoId),
    );
  
    if (!guardado) {
      return {
        configuracion: configuracionInicial,
        sesiones: [],
      };
    }
  
    try {
      const datos = JSON.parse(
        guardado,
      ) as PlanEstudioGuardado;
  
      return {
        configuracion:
          datos.configuracion ??
          configuracionInicial,
        sesiones: Array.isArray(datos.sesiones)
          ? datos.sesiones
          : [],
      };
    } catch {
      localStorage.removeItem(obtenerClave(cursoId));
  
      return {
        configuracion: configuracionInicial,
        sesiones: [],
      };
    }
  }
  
  export function guardarPlanEstudio(
    cursoId: string,
    plan: PlanEstudioGuardado,
  ) {
    localStorage.setItem(
      obtenerClave(cursoId),
      JSON.stringify(plan),
    );
  }