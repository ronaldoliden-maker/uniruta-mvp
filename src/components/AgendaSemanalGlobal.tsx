import {
  useMemo,
  useState,
} from "react";

import type { Curso } from "../types/academico";

import {
  alternarEstadoSesionAgenda,
  cargarAgendaSemanal,
  contarSesionesAtrasadas,
  reprogramarAgendaAtrasada,
} from "../utils/agendaSemanal";

import {
  formatearFechaLarga,
} from "../utils/fechasPlanEstudio";

type AgendaSemanalGlobalProps = {
  cursos: Curso[];
  onAbrirPlan: (
    cursoId: string,
  ) => void;
};

function AgendaSemanalGlobal({
  cursos,
  onAbrirPlan,
}: AgendaSemanalGlobalProps) {
  const [
    versionAgenda,
    setVersionAgenda,
  ] = useState(0);

  const [mensaje, setMensaje] =
    useState("");

  const sesiones = useMemo(
    () => cargarAgendaSemanal(cursos),
    [cursos, versionAgenda],
  );

  const pendientes = sesiones.filter(
    (sesion) =>
      sesion.estado === "Pendiente",
  ).length;

  const completadas = sesiones.filter(
    (sesion) =>
      sesion.estado ===
      "Completada",
  ).length;

  const prioridadAlta =
    sesiones.filter(
      (sesion) =>
        sesion.estado === "Pendiente" &&
        sesion.prioridad === "Alta",
    ).length;

  const atrasadas =
    contarSesionesAtrasadas(
      sesiones,
    );

  const fechas = [
    ...new Set(
      sesiones.map(
        (sesion) => sesion.fecha,
      ),
    ),
  ];

  function actualizarAgenda() {
    setVersionAgenda(
      (versionActual) =>
        versionActual + 1,
    );
  }

  function cambiarEstado(
    cursoId: string,
    sesionId: string,
  ) {
    alternarEstadoSesionAgenda(
      cursoId,
      sesionId,
    );

    actualizarAgenda();
  }

  function reprogramarTodo() {
    const cantidad =
      reprogramarAgendaAtrasada(
        cursos,
      );

    if (cantidad === 0) {
      setMensaje(
        "No existen sesiones atrasadas.",
      );
      return;
    }

    setMensaje(
      `Se reprogramaron ${cantidad} sesiones atrasadas.`,
    );

    actualizarAgenda();
  }

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Todos tus cursos</p>
          <h2>Mi semana</h2>
        </div>

        {atrasadas > 0 && (
          <button
            type="button"
            onClick={reprogramarTodo}
          >
            Reprogramar atrasadas
          </button>
        )}
      </div>

      {mensaje && (
        <p className="notes-mode-message">
          {mensaje}
        </p>
      )}

      {sesiones.length === 0 ? (
        <article className="next-activity">
          <p>Agenda semanal</p>

          <h2>
            Todavía no tienes sesiones
            planificadas
          </h2>

          <span>
            Abre un curso, entra a Plan
            de estudio y genera su plan
            inteligente.
          </span>
        </article>
      ) : (
        <>
          <div className="course-summary-grid">
            <article className="summary-card">
              <strong>
                {pendientes}
              </strong>
              <span>
                Sesiones pendientes
              </span>
            </article>

            <article className="summary-card">
              <strong>
                {atrasadas}
              </strong>
              <span>
                Sesiones atrasadas
              </span>
            </article>

            <article className="summary-card">
              <strong>
                {prioridadAlta}
              </strong>
              <span>
                Prioridad alta
              </span>
            </article>

            <article className="summary-card">
              <strong>
                {completadas}
              </strong>
              <span>
                Sesiones completadas
              </span>
            </article>
          </div>

          {fechas.map((fecha) => {
            const sesionesDeFecha =
              sesiones.filter(
                (sesion) =>
                  sesion.fecha === fecha,
              );

            return (
              <section
                className="grade-components"
                key={fecha}
              >
                <div className="activities-header">
                  <div>
                    <p>
                      {
                        sesionesDeFecha.length
                      }{" "}
                      {sesionesDeFecha.length ===
                      1
                        ? "sesión"
                        : "sesiones"}
                    </p>

                    <h2>
                      {formatearFechaLarga(
                        fecha,
                      )}
                    </h2>
                  </div>
                </div>

                <div className="activities-list">
                  {sesionesDeFecha.map(
                    (sesion) => (
                      <article
                        className="activity-card"
                        key={`${sesion.cursoId}-${sesion.id}`}
                      >
                        <div>
                          <p>
                            {sesion.cursoCodigo
                              ? `${sesion.cursoCodigo} · `
                              : ""}
                            {
                              sesion.cursoNombre
                            }
                          </p>

                          <h3>
                            {sesion.titulo}
                          </h3>

                          <p>
                            {sesion.detalle}
                          </p>

                          <p>
                            <strong>
                              Prioridad{" "}
                              {
                                sesion.prioridad
                              }
                              :
                            </strong>{" "}
                            {
                              sesion.motivoPrioridad
                            }
                          </p>

                          {sesion.reprogramada && (
                            <p>
                              <strong>
                                Reprogramada
                              </strong>
                            </p>
                          )}

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
                              {
                                sesion.prioridad
                              }
                            </span>

                            <span
                              className={`status-badge ${
                                sesion.estado ===
                                "Completada"
                                  ? "completed-status"
                                  : ""
                              }`}
                            >
                              {sesion.estado}
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
                              cambiarEstado(
                                sesion.cursoId,
                                sesion.id,
                              )
                            }
                          >
                            {sesion.estado ===
                            "Completada"
                              ? "Reabrir"
                              : "Completar"}
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}

export default AgendaSemanalGlobal;