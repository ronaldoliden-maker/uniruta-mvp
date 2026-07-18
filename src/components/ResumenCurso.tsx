import type { Curso } from "../types/academico";
import type { Actividad } from "../types/actividad";

type ResumenCursoProps = {
  curso: Curso;
  promedioActual: number | null;
  porcentajeEvaluado: number;
  pendientes: number;
  temasCompletados: number;
  totalTemas: number;
  proximaActividad?: Actividad;
};

function ResumenCurso({
  curso,
  promedioActual,
  porcentajeEvaluado,
  pendientes,
  temasCompletados,
  totalTemas,
  proximaActividad,
}: ResumenCursoProps) {
  return (
    <>
      <div className="course-summary-grid">
        <article className="summary-card">
          <strong>
            {promedioActual === null
              ? "—"
              : promedioActual.toFixed(2)}
          </strong>

          <span>Promedio evaluado</span>
        </article>

        <article className="summary-card">
          <strong>
            {porcentajeEvaluado.toFixed(2)} %
          </strong>

          <span>Ya evaluado</span>
        </article>

        <article className="summary-card">
          <strong>{pendientes}</strong>

          <span>Actividades pendientes</span>
        </article>

        <article className="summary-card">
          <strong>
            {temasCompletados}/{totalTemas}
          </strong>

          <span>Temas completados</span>
        </article>
      </div>

      {proximaActividad ? (
        <article className="next-activity">
          <p>Próxima actividad</p>

          <h2>
            {proximaActividad.nombre} —{" "}
            {proximaActividad.tipo}
          </h2>

          <span>
            {proximaActividad.semana} ·{" "}
            {proximaActividad.fecha}
          </span>
        </article>
      ) : (
        <article className="next-activity">
          <p>Próxima actividad</p>

          <h2>No tienes actividades pendientes</h2>

          <span>
            Has completado todas las actividades registradas.
          </span>
        </article>
      )}

      <section className="grade-components">
        <h2>Componentes de la nota</h2>

        {curso.componentes.length === 0 ? (
          <article className="next-activity">
            <p>Sistema de evaluación</p>

            <h2>No hay evaluaciones configuradas</h2>

            <span>
              Agrega los componentes desde la pestaña Evaluación.
            </span>
          </article>
        ) : (
          curso.componentes.map((componente) => (
            <div
              className="grade-component"
              key={componente.id}
            >
              <span>{componente.nombre}</span>

              <strong>
                {componente.peso ?? 0} %
              </strong>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default ResumenCurso;