import type {
  ConfiguracionPlanEstudio,
  PlanEstudioGuardado,
  SesionEstudio,
} from "../types/planEstudio";

const configuracionInicial: ConfiguracionPlanEstudio = {
  semanaActual: 1,
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

function normalizarSesion(
  sesion: SesionEstudio,
): SesionEstudio {
  return {
    ...sesion,
    prioridad:
      sesion.prioridad ?? "Media",
    motivoPrioridad:
      sesion.motivoPrioridad ??
      "Sesión generada con una versión anterior del planificador.",
  };
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
    ) as Partial<PlanEstudioGuardado>;

    return {
      configuracion: {
        ...configuracionInicial,
        ...(datos.configuracion ?? {}),
      },
      sesiones: Array.isArray(datos.sesiones)
        ? datos.sesiones.map(normalizarSesion)
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