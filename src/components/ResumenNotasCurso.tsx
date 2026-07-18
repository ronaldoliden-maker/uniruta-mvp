import type { Curso } from "../types/academico";

type ResumenNotasCursoProps = {
  curso: Curso;
  esSimulacion: boolean;
  notaFinalMostrada: number;
  notaFinalRedondeada: number;
  porcentajeEvaluado: number;
  estadoMostrado: string;
};

function ResumenNotasCurso({
  curso,
  esSimulacion,
  notaFinalMostrada,
  notaFinalRedondeada,
  porcentajeEvaluado,
  estadoMostrado,
}: ResumenNotasCursoProps) {
  const formula = curso.componentes
    .map(
      (componente) =>
        `${componente.peso ?? 0} % ${componente.nombre}`,
    )
    .join(" + ");

  return (
    <>
      <div className="grades-heading">
        <p>Calculadora del curso</p>

        <h2>Sistema de evaluación</h2>

        <span>
          {formula
            ? `Nota final = ${formula}`
            : "Todavía no hay evaluaciones configuradas"}
        </span>
      </div>

      <div className="final-grade-grid">
        <article className="final-grade-card">
          <span>
            {esSimulacion
              ? "Nota final simulada"
              : "Nota final provisional"}
          </span>

          <strong>
            {notaFinalMostrada.toFixed(2)}
          </strong>
        </article>

        <article className="final-grade-card">
          <span>Nota final redondeada</span>

          <strong>{notaFinalRedondeada}</strong>
        </article>

        <article className="final-grade-card">
          <span>Porcentaje oficialmente evaluado</span>

          <strong>
            {porcentajeEvaluado.toFixed(2)} %
          </strong>
        </article>

        <article className="final-grade-card">
          <span>Estado</span>

          <strong className="grade-status">
            {estadoMostrado}
          </strong>
        </article>
      </div>
    </>
  );
}

export default ResumenNotasCurso;