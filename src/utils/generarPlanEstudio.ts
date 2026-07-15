import type { Actividad } from "../types/actividad";
import type {
  ConfiguracionPlanEstudio,
  SesionEstudio,
} from "../types/planEstudio";
import type { TemaCurso } from "../types/tema";

function obtenerNumeroSemana(texto: string) {
  const coincidencia = texto.match(/\d+/);

  return coincidencia ? Number(coincidencia[0]) : 999;
}

export function generarPlanEstudio(
  cursoId: string,
  temario: TemaCurso[],
  actividades: Actividad[],
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

  const actividadesPendientes = [...actividades]
    .filter(
      (actividad) =>
        actividad.estado !== "Completada",
    )
    .sort(
      (actividadA, actividadB) =>
        obtenerNumeroSemana(actividadA.semana) -
        obtenerNumeroSemana(actividadB.semana),
    );

  const temasPendientes = [...temario]
    .filter((tema) => tema.estado !== "Completado")
    .sort(
      (temaA, temaB) =>
        temaA.semana - temaB.semana ||
        temaA.titulo.localeCompare(temaB.titulo),
    );

  const elementos = [
    ...actividadesPendientes.map((actividad) => ({
      titulo: actividad.nombre,
      detalle: `${actividad.tipo} · ${actividad.semana} · ${actividad.fecha}`,
      origen: "Actividad" as const,
    })),
    ...temasPendientes.map((tema) => ({
      titulo: tema.titulo,
      detalle: `Semana ${tema.semana}${
        tema.detalle ? ` · ${tema.detalle}` : ""
      }`,
      origen: "Temario" as const,
    })),
  ];

  if (elementos.length === 0) {
    return [];
  }

  const sello = Date.now();

  return Array.from(
    { length: Math.min(cantidadSesiones, 14) },
    (_, indice) => {
      const elemento =
        elementos[indice % elementos.length];

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
        estado: "Pendiente" as const,
      };
    },
  );
}