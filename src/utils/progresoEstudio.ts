import type { Curso } from "../types/academico";

import {
  cargarPlanEstudio,
} from "./almacenamientoPlanEstudio";

export type ProgresoCursoSemanal = {
  cursoId: string;
  cursoNombre: string;
  cursoCodigo?: string;
  sesionesPlanificadas: number;
  sesionesCompletadas: number;
  minutosPlanificados: number;
  minutosCompletados: number;
  porcentajeCompletado: number;
};

export type ProgresoSemanal = {
  fechaInicio: string;
  fechaFin: string;
  sesionesPlanificadas: number;
  sesionesCompletadas: number;
  minutosPlanificados: number;
  minutosCompletados: number;
  porcentajeCompletado: number;
  cursos: ProgresoCursoSemanal[];
};

function agregarCeros(valor: number) {
  return String(valor).padStart(2, "0");
}

function fechaISO(fecha: Date) {
  return `${fecha.getFullYear()}-${agregarCeros(
    fecha.getMonth() + 1,
  )}-${agregarCeros(fecha.getDate())}`;
}

function obtenerRangoSemanaActual() {
  const hoy = new Date();
  const diaActual = hoy.getDay();

  const diferenciaHastaLunes =
    diaActual === 0 ? -6 : 1 - diaActual;

  const inicio = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() + diferenciaHastaLunes,
  );

  const fin = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate() + 6,
  );

  return {
    fechaInicio: fechaISO(inicio),
    fechaFin: fechaISO(fin),
  };
}

function calcularPorcentaje(
  completadas: number,
  planificadas: number,
) {
  if (planificadas === 0) {
    return 0;
  }

  return Math.round(
    (completadas / planificadas) * 100,
  );
}

export function calcularProgresoSemanal(
  cursos: Curso[],
): ProgresoSemanal {
  const { fechaInicio, fechaFin } =
    obtenerRangoSemanaActual();

  const progresoCursos = cursos
    .map((curso) => {
      const plan = cargarPlanEstudio(curso.id);

      const sesionesSemana =
        plan.sesiones.filter(
          (sesion) =>
            sesion.fecha >= fechaInicio &&
            sesion.fecha <= fechaFin,
        );

      const sesionesCompletadas =
        sesionesSemana.filter(
          (sesion) =>
            sesion.estado === "Completada",
        );

      const minutosPlanificados =
        sesionesSemana.reduce(
          (total, sesion) =>
            total + sesion.duracionMinutos,
          0,
        );

      const minutosCompletados =
        sesionesCompletadas.reduce(
          (total, sesion) =>
            total + sesion.duracionMinutos,
          0,
        );

      return {
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        cursoCodigo: curso.codigo,
        sesionesPlanificadas:
          sesionesSemana.length,
        sesionesCompletadas:
          sesionesCompletadas.length,
        minutosPlanificados,
        minutosCompletados,
        porcentajeCompletado:
          calcularPorcentaje(
            sesionesCompletadas.length,
            sesionesSemana.length,
          ),
      };
    })
    .filter(
      (curso) =>
        curso.sesionesPlanificadas > 0,
    )
    .sort(
      (cursoA, cursoB) =>
        cursoB.porcentajeCompletado -
        cursoA.porcentajeCompletado,
    );

  const sesionesPlanificadas =
    progresoCursos.reduce(
      (total, curso) =>
        total +
        curso.sesionesPlanificadas,
      0,
    );

  const sesionesCompletadas =
    progresoCursos.reduce(
      (total, curso) =>
        total +
        curso.sesionesCompletadas,
      0,
    );

  const minutosPlanificados =
    progresoCursos.reduce(
      (total, curso) =>
        total +
        curso.minutosPlanificados,
      0,
    );

  const minutosCompletados =
    progresoCursos.reduce(
      (total, curso) =>
        total +
        curso.minutosCompletados,
      0,
    );

  return {
    fechaInicio,
    fechaFin,
    sesionesPlanificadas,
    sesionesCompletadas,
    minutosPlanificados,
    minutosCompletados,
    porcentajeCompletado:
      calcularPorcentaje(
        sesionesCompletadas,
        sesionesPlanificadas,
      ),
    cursos: progresoCursos,
  };
}