import {
    useMemo,
    useState,
  } from "react";
  
  import type { Curso } from "../types/academico";
  
  import {
    alternarEstadoSesionAgenda,
    cargarAgendaSemanal,
  } from "../utils/agendaSemanal";
  
  import {
    esSesionAtrasada,
    formatearFechaLarga,
    obtenerFechaHoy,
  } from "../utils/fechasPlanEstudio";
  
  type ResumenHoyGlobalProps = {
    cursos: Curso[];
    onAbrirPlan: (
      cursoId: string,
    ) => void;
  };
  
  function ResumenHoyGlobal({
    cursos,
    onAbrirPlan,
  }: ResumenHoyGlobalProps) {
    const [
      versionResumen,
      setVersionResumen,
    ] = useState(0);
  
    const hoy = obtenerFechaHoy();
  
    const sesiones = useMemo(
      () => cargarAgendaSemanal(cursos),
      [cursos, versionResumen],
    );
  
    const sesionesHoy = sesiones.filter(
      (sesion) =>
        sesion.fecha === hoy &&
        sesion.estado === "Pendiente",
    );
  
    const sesionesAtrasadas =
      sesiones.filter(esSesionAtrasada);
  
    const minutosHoy = sesionesHoy.reduce(
      (total, sesion) =>
        total + sesion.duracionMinutos,
      0,
    );
  
    function completarSesion(
      cursoId: string,
      sesionId: string,
    ) {
      alternarEstadoSesionAgenda(
        cursoId,
        sesionId,
      );
  
      setVersionResumen(
        (versionActual) =>
          versionActual + 1,
      );
    }
  
    return (
      <section className="activities-panel">
        <div className="activities-header">
          <div>
            <p>Tu jornada académica</p>
  
            <h2>Hoy</h2>
          </div>
  
          <span>
            {formatearFechaLarga(hoy)}
          </span>
        </div>
  
        <div className="course-summary-grid">
          <article className="summary-card">
            <strong>
              {sesionesHoy.length}
            </strong>
  
            <span>
              Sesiones para hoy
            </span>
          </article>
  
          <article className="summary-card">
            <strong>
              {minutosHoy}
            </strong>
  
            <span>
              Minutos planificados
            </span>
          </article>
  
          <article className="summary-card">
            <strong>
              {sesionesAtrasadas.length}
            </strong>
  
            <span>
              Sesiones atrasadas
            </span>
          </article>
        </div>
  
        {sesionesHoy.length === 0 ? (
          <article className="next-activity">
            <p>Agenda de hoy</p>
  
            <h2>
              No tienes sesiones pendientes
              para hoy
            </h2>
  
            <span>
              Puedes descansar, adelantar un
              tema o revisar Mi semana.
            </span>
          </article>
        ) : (
          <div className="activities-list">
            {sesionesHoy.map((sesion) => (
              <article
                className="activity-card"
                key={`${sesion.cursoId}-${sesion.id}`}
              >
                <div>
                  <p>
                    {sesion.cursoCodigo
                      ? `${sesion.cursoCodigo} · `
                      : ""}
                    {sesion.cursoNombre}
                  </p>
  
                  <h3>{sesion.titulo}</h3>
  
                  <p>{sesion.detalle}</p>
  
                  <p>
                    <strong>
                      Prioridad{" "}
                      {sesion.prioridad}:
                    </strong>{" "}
                    {
                      sesion.motivoPrioridad
                    }
                  </p>
  
                  <div className="activity-meta">
                    <span>
                      {
                        sesion.duracionMinutos
                      }{" "}
                      minutos
                    </span>
  
                    <span>
                      {sesion.origen}
                    </span>
  
                    <span>
                      Prioridad{" "}
                      {sesion.prioridad}
                    </span>
                  </div>
                </div>
  
                <div className="activity-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      onAbrirPlan(
                        sesion.cursoId,
                      )
                    }
                  >
                    Abrir plan
                  </button>
  
                  <button
                    type="button"
                    className="activity-status-button"
                    onClick={() =>
                      completarSesion(
                        sesion.cursoId,
                        sesion.id,
                      )
                    }
                  >
                    Completar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
  
        {sesionesAtrasadas.length > 0 && (
          <article className="next-activity">
            <p>Atención</p>
  
            <h2>
              Tienes{" "}
              {sesionesAtrasadas.length}{" "}
              {sesionesAtrasadas.length ===
              1
                ? "sesión atrasada"
                : "sesiones atrasadas"}
            </h2>
  
            <span>
              Usa Reprogramar atrasadas en
              Mi semana para moverlas a tus
              próximos días disponibles.
            </span>
          </article>
        )}
      </section>
    );
  }
  
  export default ResumenHoyGlobal;