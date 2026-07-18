import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import type { Curso } from "../types/academico";
  
  import {
    calcularProgresoSemanal,
  } from "../utils/progresoEstudio";
  
  type ProgresoEstudioGlobalProps = {
    cursos: Curso[];
    onAbrirPlan: (
      cursoId: string,
    ) => void;
  };
  
  function formatearMinutos(
    minutos: number,
  ) {
    const horas = Math.floor(minutos / 60);
    const restantes = minutos % 60;
  
    if (horas === 0) {
      return `${restantes} min`;
    }
  
    if (restantes === 0) {
      return `${horas} h`;
    }
  
    return `${horas} h ${restantes} min`;
  }
  
  function formatearFechaCorta(
    fechaISO: string,
  ) {
    const [anio, mes, dia] =
      fechaISO.split("-").map(Number);
  
    return new Intl.DateTimeFormat(
      "es-PE",
      {
        day: "numeric",
        month: "short",
      },
    ).format(
      new Date(anio, mes - 1, dia),
    );
  }
  
  function ProgresoEstudioGlobal({
    cursos,
    onAbrirPlan,
  }: ProgresoEstudioGlobalProps) {
    const [
      versionProgreso,
      setVersionProgreso,
    ] = useState(0);
  
    useEffect(() => {
      function actualizarProgreso() {
        setVersionProgreso(
          (versionActual) =>
            versionActual + 1,
        );
      }
  
      window.addEventListener(
        "uniruta-plan-actualizado",
        actualizarProgreso,
      );
  
      return () => {
        window.removeEventListener(
          "uniruta-plan-actualizado",
          actualizarProgreso,
        );
      };
    }, []);
  
    const progreso = useMemo(
      () =>
        calcularProgresoSemanal(cursos),
      [cursos, versionProgreso],
    );
  
    return (
      <section className="activities-panel">
        <div className="activities-header">
          <div>
            <p>
              Del{" "}
              {formatearFechaCorta(
                progreso.fechaInicio,
              )}{" "}
              al{" "}
              {formatearFechaCorta(
                progreso.fechaFin,
              )}
            </p>
  
            <h2>Progreso semanal</h2>
          </div>
        </div>
  
        <div className="course-summary-grid">
          <article className="summary-card">
            <strong>
              {progreso.porcentajeCompletado}
              %
            </strong>
  
            <span>
              Avance de la semana
            </span>
          </article>
  
          <article className="summary-card">
            <strong>
              {progreso.sesionesCompletadas}
              /{progreso.sesionesPlanificadas}
            </strong>
  
            <span>
              Sesiones completadas
            </span>
          </article>
  
          <article className="summary-card">
            <strong>
              {formatearMinutos(
                progreso.minutosCompletados,
              )}
            </strong>
  
            <span>
              Tiempo estudiado
            </span>
          </article>
  
          <article className="summary-card">
            <strong>
              {formatearMinutos(
                progreso.minutosPlanificados,
              )}
            </strong>
  
            <span>
              Tiempo planificado
            </span>
          </article>
        </div>
  
        {progreso.cursos.length === 0 ? (
          <article className="next-activity">
            <p>Seguimiento semanal</p>
  
            <h2>
              Todavía no hay sesiones para
              esta semana
            </h2>
  
            <span>
              Genera un plan de estudio con
              fechas dentro de la semana
              actual.
            </span>
          </article>
        ) : (
          <div className="activities-list">
            {progreso.cursos.map(
              (curso) => (
                <article
                  className="activity-card"
                  key={curso.cursoId}
                >
                  <div>
                    <p>
                      {curso.cursoCodigo ??
                        "Sin código"}
                    </p>
  
                    <h3>
                      {curso.cursoNombre}
                    </h3>
  
                    <p>
                      {
                        curso.sesionesCompletadas
                      }{" "}
                      de{" "}
                      {
                        curso.sesionesPlanificadas
                      }{" "}
                      sesiones completadas.
                    </p>
  
                    <div className="activity-meta">
                      <span>
                        {
                          curso.porcentajeCompletado
                        }
                        % completado
                      </span>
  
                      <span>
                        {formatearMinutos(
                          curso.minutosCompletados,
                        )}{" "}
                        estudiados
                      </span>
  
                      <span>
                        {formatearMinutos(
                          curso.minutosPlanificados,
                        )}{" "}
                        planificados
                      </span>
                    </div>
                  </div>
  
                  <div className="activity-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        onAbrirPlan(
                          curso.cursoId,
                        )
                      }
                    >
                      Abrir plan
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    );
  }
  
  export default ProgresoEstudioGlobal;