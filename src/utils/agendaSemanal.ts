import type { Curso } from "../types/academico";
import type {
  DiaSemana,
  SesionEstudio,
} from "../types/planEstudio";

import {
  cargarPlanEstudio,
  guardarPlanEstudio,
} from "./almacenamientoPlanEstudio";

export type SesionAgendaGlobal =
  SesionEstudio & {
    cursoId: string;
    cursoNombre: string;
    cursoCodigo?: string;
  };

export const ORDEN_DIAS: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

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
      const plan = cargarPlanEstudio(curso.id);

      return plan.sesiones.map((sesion) => ({
        ...sesion,
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        cursoCodigo: curso.codigo,
      }));
    })
    .sort((sesionA, sesionB) => {
      const diaA = ORDEN_DIAS.indexOf(
        sesionA.dia,
      );

      const diaB = ORDEN_DIAS.indexOf(
        sesionB.dia,
      );

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      if (sesionA.estado !== sesionB.estado) {
        return sesionA.estado === "Pendiente"
          ? -1
          : 1;
      }

      return (
        valorPrioridad(sesionB.prioridad) -
        valorPrioridad(sesionA.prioridad)
      );
    });
}

export function alternarEstadoSesionAgenda(
  cursoId: string,
  sesionId: string,
) {
  const plan = cargarPlanEstudio(cursoId);

  const sesionesActualizadas =
    plan.sesiones.map((sesion) =>
      sesion.id === sesionId
        ? {
            ...sesion,
            estado:
              sesion.estado === "Completada"
                ? ("Pendiente" as const)
                : ("Completada" as const),
          }
        : sesion,
    );

  guardarPlanEstudio(cursoId, {
    ...plan,
    sesiones: sesionesActualizadas,
  });
}