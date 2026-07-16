import type {
  ConfiguracionPlanEstudio,
  PlanEstudioGuardado,
  SesionEstudio,
} from "../types/planEstudio";

import {
  obtenerDiaDeFecha,
  obtenerFechaHoy,
  obtenerProximaFechaParaDia,
} from "./fechasPlanEstudio";

function crearConfiguracionInicial(): ConfiguracionPlanEstudio {
  return {
    semanaActual: 1,
    fechaInicio: obtenerFechaHoy(),
    horasSemanales: 6,
    duracionSesion: 60,
    diasDisponibles: [
      "Lunes",
      "Miércoles",
      "Viernes",
    ],
  };
}

function obtenerClave(cursoId: string) {
  return `uniruta-curso-${cursoId}-plan-estudio`;
}

function normalizarSesion(
  sesion: SesionEstudio,
): SesionEstudio {
  const fecha =
    sesion.fecha ||
    obtenerProximaFechaParaDia(
      sesion.dia,
    );

  return {
    ...sesion,
    fecha,
    dia: obtenerDiaDeFecha(fecha),
    prioridad:
      sesion.prioridad ?? "Media",
    motivoPrioridad:
      sesion.motivoPrioridad ??
      "Sesión creada con una versión anterior del planificador.",
    reprogramada:
      sesion.reprogramada ?? false,
  };
}

export function cargarPlanEstudio(
  cursoId: string,
): PlanEstudioGuardado {
  const configuracionInicial =
    crearConfiguracionInicial();

  const guardado = localStorage.getItem(
    obtenerClave(cursoId),
  );

  if (!guardado) {
    return {
      configuracion:
        configuracionInicial,
      sesiones: [],
    };
  }

  try {
    const datos = JSON.parse(
      guardado,
    ) as Partial<PlanEstudioGuardado>;

    return {
      configuracion: {
        ...configuracionInicial,
        ...(datos.configuracion ?? {}),
        fechaInicio:
          datos.configuracion
            ?.fechaInicio ||
          obtenerFechaHoy(),
      },
      sesiones: Array.isArray(
        datos.sesiones,
      )
        ? datos.sesiones.map(
            normalizarSesion,
          )
        : [],
    };
  } catch {
    localStorage.removeItem(
      obtenerClave(cursoId),
    );

    return {
      configuracion:
        configuracionInicial,
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