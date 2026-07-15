import { useMemo, useState } from "react";

import type { Curso } from "../types/academico";

import {
  alternarEstadoSesionAgenda,
  cargarAgendaSemanal,
  ORDEN_DIAS,
} from "../utils/agendaSemanal";

type AgendaSemanalGlobalProps = {
  cursos: Curso[];
  onAbrirPlan: (cursoId: string) => void;
};

function AgendaSemanalGlobal({
  cursos,
  onAbrirPlan,
}: AgendaSemanalGlobalProps) {
  const [versionAgenda, setVersionAgenda] =
    useState(0);

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
      sesion.estado === "Completada",
  ).length;

  const prioridadAlta = sesiones.filter(
    (sesion) =>
      sesion.estado === "Pendiente" &&
      sesion.prioridad === "Alta",
  ).length;

  function cambiarEstado(
    cursoId: string,
    sesionId: string,
  ) {
    alternarEstadoSesionAgenda(
      cursoId,
      sesionId,
    );

    setVersionAgenda(
      (versionActual) =>
        versionActual + 1,
    );
  }

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Todos tus cursos</p>
          <h2>Mi semana</h2>
        </div>
      </div>

      {sesiones.length === 0 ? (
        <article className="next-activity">
          <p>Agenda semanal</p>

          <h2>
            Todavía no tienes sesiones
            planificadas
          </h2>

          <span>
            Abre un curso, entra a Plan de
            estudio y genera su plan
            inteligente.
          </span>
        </article>
      ) : (
        <>
          <div className="course-summary-grid">
            <article className="summary-card">
              <strong>{pendientes}</strong>
              <span>Sesiones pendientes</span>
            </article>

            <article className="summary-card">
              <strong>{prioridadAlta}</strong>
              <span>Prioridad alta</span>
            </article>

            <article className="summary-card">
              <strong>{completadas}</strong>
              <span>Sesiones completadas</span>
            </article>

            <article className="summary-card">
              <strong>{sesiones.length}</strong>
              <span>Total planificado</span>
            </article>
          </div>

          {ORDEN_DIAS.map((dia) => {
            const sesionesDelDia =
              sesiones.filter(
                (sesion) =>
                  sesion.dia === dia,
              );

            if (
              sesionesDelDia.length === 0
            ) {
              return null;
            }

            return (
              <section
                className="grade-components"
                key={dia}
              >
                <div className="activities-header">
                  <div>
                    <p>
                      {
                        sesionesDelDia.length
                      }{" "}
                      {sesionesDelDia.length ===
                      1
                        ? "sesión"
                        : "sesiones"}
                    </p>

                    <h2>{dia}</h2>
                  </div>
                </div>

                <div className="activities-list">
                  {sesionesDelDia.map(
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
                            {sesion.cursoNombre}
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