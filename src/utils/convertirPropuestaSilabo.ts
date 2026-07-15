import type { ComponenteNota } from "../types/academico";
import type { Actividad } from "../types/actividad";
import type { PropuestaSilabo } from "../types/propuestaSilabo";
import type { TemaCurso } from "../types/tema";

export type ResultadoImportacionSilabo = {
  nombreCurso: string;
  codigoCurso?: string;
  notaMinima: number;
  componentes: ComponenteNota[];
  temas: TemaCurso[];
  actividades: Actividad[];
  temasConSemanaAutomatica: number;
};

function convertirSemana(
  valor: string,
  semanaAlternativa: number,
) {
  const semana = Number(valor);

  if (
    Number.isInteger(semana) &&
    semana >= 1 &&
    semana <= 20
  ) {
    return semana;
  }

  return Math.min(semanaAlternativa, 20);
}

export function convertirPropuestaSilabo(
  propuesta: PropuestaSilabo,
  cursoId: string,
): ResultadoImportacionSilabo {
  const sello = Date.now();

  const componentes: ComponenteNota[] =
    propuesta.evaluaciones.map(
      (evaluacion, indice) => ({
        id: `silabo-${cursoId}-evaluacion-${sello}-${indice}`,
        nombre: evaluacion.nombre.trim(),
        tipo: "nota_directa",
        peso: Number(evaluacion.peso),
        notaMaxima: 20,
        redondeo: "ninguno",
      }),
    );

  let temasConSemanaAutomatica = 0;

  const temas: TemaCurso[] = propuesta.temas
    .filter((tema) => tema.titulo.trim())
    .map((tema, indice) => {
      const semanaIndicada = Number(tema.semana);
      const semanaEsValida =
        Number.isInteger(semanaIndicada) &&
        semanaIndicada >= 1 &&
        semanaIndicada <= 20;

      if (!semanaEsValida) {
        temasConSemanaAutomatica += 1;
      }

      return {
        id: sello + 1000 + indice,
        semana: convertirSemana(
          tema.semana,
          indice + 1,
        ),
        titulo: tema.titulo.trim(),
        detalle: "Importado desde el sílabo.",
        estado: "Pendiente",
      };
    });

  const actividades: Actividad[] =
    propuesta.evaluaciones.flatMap(
      (evaluacion, indice) => {
        const semana = Number(evaluacion.semana);

        if (
          !Number.isInteger(semana) ||
          semana < 1 ||
          semana > 20
        ) {
          return [];
        }

        const esExamen = /examen/i.test(
          evaluacion.nombre,
        );

        return [
          {
            id: sello + 2000 + indice,
            nombre: evaluacion.nombre.trim(),
            tipo: esExamen
              ? "Examen"
              : "Evaluación en aula",
            semana: `Semana ${semana}`,
            fecha: "Fecha exacta pendiente",
            estado: "No iniciada",
          },
        ];
      },
    );

  return {
    nombreCurso:
      propuesta.nombreCurso.trim(),
    codigoCurso:
      propuesta.codigoCurso.trim().toUpperCase() ||
      undefined,
    notaMinima: Number(propuesta.notaMinima),
    componentes,
    temas,
    actividades,
    temasConSemanaAutomatica,
  };
}

function claveActividad(
  actividad: Pick<
    Actividad,
    "nombre" | "semana"
  >,
) {
  return `${actividad.nombre.trim().toLowerCase()}|${actividad.semana
    .trim()
    .toLowerCase()}`;
}

export function combinarActividadesSinDuplicados(
  existentes: Actividad[],
  importadas: Actividad[],
) {
  const clavesExistentes = new Set(
    existentes.map(claveActividad),
  );

  const nuevas = importadas.filter(
    (actividad) =>
      !clavesExistentes.has(
        claveActividad(actividad),
      ),
  );

  return [...existentes, ...nuevas];
}