import type { Curso } from "../types/academico";
import type { SesionEstudio } from "../types/planEstudio";

import {
  cargarPlanEstudio,
  guardarPlanEstudio,
} from "./almacenamientoPlanEstudio";

import {
  esSesionAtrasada,
  reprogramarSesionesAtrasadas,
} from "./fechasPlanEstudio";

export type SesionAgendaGlobal =
  SesionEstudio & {
    cursoId: string;
    cursoNombre: string;
    cursoCodigo?: string;
  };

function valorPrioridad(
  prioridad: SesionEstudio["prioridad"],
) {
  if (prioridad === "Alta") {
    return 3;
  }

  if (prioridad === "Media") {
    return 2;
  }

  return 1;
}

export function cargarAgendaSemanal(
  cursos: Curso[],
): SesionAgendaGlobal[] {
  return cursos
    .flatMap((curso) => {
      const plan =
        cargarPlanEstudio(curso.id);

      return plan.sesiones.map(
        (sesion) => ({
          ...sesion,
          cursoId: curso.id,
          cursoNombre: curso.nombre,
          cursoCodigo: curso.codigo,
        }),
      );
    })
    .sort((sesionA, sesionB) => {
      const comparacionFecha =
        sesionA.fecha.localeCompare(
          sesionB.fecha,
        );

      if (comparacionFecha !== 0) {
        return comparacionFecha;
      }

      if (
        sesionA.estado !==
        sesionB.estado
      ) {
        return sesionA.estado ===
          "Pendiente"
          ? -1
          : 1;
      }

      return (
        valorPrioridad(
          sesionB.prioridad,
        ) -
        valorPrioridad(
          sesionA.prioridad,
        )
      );
    });
}

export function alternarEstadoSesionAgenda(
  cursoId: string,
  sesionId: string,
) {
  const plan =
    cargarPlanEstudio(cursoId);

  const sesionesActualizadas =
    plan.sesiones.map((sesion) =>
      sesion.id === sesionId
        ? {
            ...sesion,
            estado:
              sesion.estado ===
              "Completada"
                ? ("Pendiente" as const)
                : ("Completada" as const),
          }
        : sesion,
    );

  guardarPlanEstudio(cursoId, {
    ...plan,
    sesiones:
      sesionesActualizadas,
  });
}

export function reprogramarAgendaAtrasada(
  cursos: Curso[],
) {
  let totalReprogramado = 0;

  cursos.forEach((curso) => {
    const plan =
      cargarPlanEstudio(curso.id);

    const resultado =
      reprogramarSesionesAtrasadas(
        plan.sesiones,
        plan.configuracion
          .diasDisponibles,
      );

    if (
      resultado.cantidadReprogramada >
      0
    ) {
      guardarPlanEstudio(curso.id, {
        ...plan,
        sesiones: resultado.sesiones,
      });

      totalReprogramado +=
        resultado.cantidadReprogramada;
    }
  });

  return totalReprogramado;
}

export function contarSesionesAtrasadas(
  sesiones: SesionAgendaGlobal[],
) {
  return sesiones.filter(
    esSesionAtrasada,
  ).length;
}