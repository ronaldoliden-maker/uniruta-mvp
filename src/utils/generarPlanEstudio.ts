import type {
  ComponenteNota,
} from "../types/academico";
import type { Actividad } from "../types/actividad";
import type {
  ConfiguracionPlanEstudio,
  PrioridadSesion,
  SesionEstudio,
} from "../types/planEstudio";
import type { TemaCurso } from "../types/tema";

import {
  obtenerEvaluacionesDirectas,
  obtenerPesosEvaluacionesDirectas,
} from "./calcularNotas";

type ElementoPlan = {
  titulo: string;
  detalle: string;
  origen: "Actividad" | "Temario";
  prioridad: PrioridadSesion;
  motivoPrioridad: string;
  puntaje: number;
};

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function obtenerNumeroSemana(texto: string) {
  const coincidencia = texto.match(/\d+/);

  return coincidencia ? Number(coincidencia[0]) : 999;
}

function calcularPrioridad(
  puntaje: number,
): PrioridadSesion {
  if (puntaje >= 60) {
    return "Alta";
  }

  if (puntaje >= 30) {
    return "Media";
  }

  return "Baja";
}

function calcularUrgencia(
  semanaObjetivo: number,
  semanaActual: number,
) {
  const diferencia =
    semanaObjetivo - semanaActual;

  if (diferencia < 0) {
    return {
      puntaje: 65,
      motivo: "Está atrasada respecto de la semana actual.",
    };
  }

  if (diferencia === 0) {
    return {
      puntaje: 60,
      motivo: "Corresponde a esta semana.",
    };
  }

  if (diferencia === 1) {
    return {
      puntaje: 48,
      motivo: "Está programada para la próxima semana.",
    };
  }

  if (diferencia <= 3) {
    return {
      puntaje: 30,
      motivo: `Faltan ${diferencia} semanas.`,
    };
  }

  return {
    puntaje: 10,
    motivo: `Está prevista para la semana ${semanaObjetivo}.`,
  };
}

function buscarPesoActividad(
  nombreActividad: string,
  componentes: ComponenteNota[],
) {
  const evaluaciones =
    obtenerEvaluacionesDirectas(componentes);

  const pesos =
    obtenerPesosEvaluacionesDirectas(componentes);

  const nombreNormalizado =
    normalizarTexto(nombreActividad);

  const coincidencia = evaluaciones.find(
    (evaluacion) => {
      const evaluacionNormalizada =
        normalizarTexto(evaluacion.nombre);

      return (
        evaluacionNormalizada === nombreNormalizado ||
        nombreNormalizado.includes(
          evaluacionNormalizada,
        ) ||
        evaluacionNormalizada.includes(
          nombreNormalizado,
        )
      );
    },
  );

  if (!coincidencia) {
    return 0;
  }

  return pesos[coincidencia.id] ?? 0;
}

function crearElementosActividad(
  actividades: Actividad[],
  componentes: ComponenteNota[],
  semanaActual: number,
): ElementoPlan[] {
  return actividades
    .filter(
      (actividad) =>
        actividad.estado !== "Completada",
    )
    .map((actividad) => {
      const semana =
        obtenerNumeroSemana(actividad.semana);

      const urgencia =
        calcularUrgencia(
          semana,
          semanaActual,
        );

      const peso =
        buscarPesoActividad(
          actividad.nombre,
          componentes,
        );

      const bonoTipo =
        /examen|parcial|final/i.test(
          `${actividad.nombre} ${actividad.tipo}`,
        )
          ? 12
          : 0;

      const puntaje =
        urgencia.puntaje +
        Math.min(peso, 35) +
        bonoTipo;

      const motivos = [urgencia.motivo];

      if (peso > 0) {
        motivos.push(
          `Representa ${peso.toFixed(
            2,
          )} % de la nota final.`,
        );
      }

      if (bonoTipo > 0) {
        motivos.push(
          "Es una evaluación de alta exigencia.",
        );
      }

      return {
        titulo: actividad.nombre,
        detalle: `${actividad.tipo} · ${actividad.semana} · ${actividad.fecha}`,
        origen: "Actividad" as const,
        prioridad:
          calcularPrioridad(puntaje),
        motivoPrioridad:
          motivos.join(" "),
        puntaje,
      };
    });
}

function crearElementosTemario(
  temario: TemaCurso[],
  semanaActual: number,
): ElementoPlan[] {
  return temario
    .filter(
      (tema) => tema.estado !== "Completado",
    )
    .map((tema) => {
      const urgencia =
        calcularUrgencia(
          tema.semana,
          semanaActual,
        );

      const puntaje = Math.max(
        8,
        urgencia.puntaje - 15,
      );

      return {
        titulo: tema.titulo,
        detalle: `Semana ${tema.semana}${
          tema.detalle
            ? ` · ${tema.detalle}`
            : ""
        }`,
        origen: "Temario" as const,
        prioridad:
          calcularPrioridad(puntaje),
        motivoPrioridad:
          urgencia.motivo,
        puntaje,
      };
    });
}

function crearColaPriorizada(
  elementos: ElementoPlan[],
) {
  const ordenados = [...elementos].sort(
    (elementoA, elementoB) =>
      elementoB.puntaje -
      elementoA.puntaje,
  );

  return ordenados.flatMap((elemento) => {
    const repeticiones =
      elemento.prioridad === "Alta"
        ? 3
        : elemento.prioridad === "Media"
          ? 2
          : 1;

    return Array.from(
      { length: repeticiones },
      () => elemento,
    );
  });
}

export function generarPlanEstudio(
  cursoId: string,
  temario: TemaCurso[],
  actividades: Actividad[],
  componentes: ComponenteNota[],
  configuracion: ConfiguracionPlanEstudio,
): SesionEstudio[] {
  const minutosDisponibles =
    configuracion.horasSemanales * 60;

  const cantidadSesiones = Math.floor(
    minutosDisponibles /
      configuracion.duracionSesion,
  );

  if (
    cantidadSesiones <= 0 ||
    configuracion.diasDisponibles.length === 0
  ) {
    return [];
  }

  const elementos = [
    ...crearElementosActividad(
      actividades,
      componentes,
      configuracion.semanaActual,
    ),
    ...crearElementosTemario(
      temario,
      configuracion.semanaActual,
    ),
  ];

  if (elementos.length === 0) {
    return [];
  }

  const cola =
    crearColaPriorizada(elementos);

  const sello = Date.now();

  return Array.from(
    {
      length: Math.min(
        cantidadSesiones,
        14,
      ),
    },
    (_, indice) => {
      const elemento =
        cola[indice % cola.length];

      const dia =
        configuracion.diasDisponibles[
          indice %
            configuracion.diasDisponibles.length
        ];

      return {
        id: `${cursoId}-sesion-${sello}-${indice}`,
        dia,
        duracionMinutos:
          configuracion.duracionSesion,
        titulo: elemento.titulo,
        detalle: elemento.detalle,
        origen: elemento.origen,
        prioridad: elemento.prioridad,
        motivoPrioridad:
          elemento.motivoPrioridad,
        estado: "Pendiente" as const,
      };
    },
  );
}