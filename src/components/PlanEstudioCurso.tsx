import { useEffect, useState } from "react";

import type {
  ComponenteNota,
} from "../types/academico";
import type { Actividad } from "../types/actividad";
import type {
  ConfiguracionPlanEstudio,
  DiaSemana,
  SesionEstudio,
} from "../types/planEstudio";
import type { TemaCurso } from "../types/tema";

import {
  cargarPlanEstudio,
  guardarPlanEstudio,
} from "../utils/almacenamientoPlanEstudio";

import { generarPlanEstudio } from "../utils/generarPlanEstudio";

type PlanEstudioCursoProps = {
  cursoId: string;
  nombreCurso: string;
  temario: TemaCurso[];
  actividades: Actividad[];
  componentes: ComponenteNota[];
};

const dias: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function PlanEstudioCurso({
  cursoId,
  nombreCurso,
  temario,
  actividades,
  componentes,
}: PlanEstudioCursoProps) {
  const planInicial =
    cargarPlanEstudio(cursoId);

  const [configuracion, setConfiguracion] =
    useState<ConfiguracionPlanEstudio>(
      planInicial.configuracion,
    );

  const [sesiones, setSesiones] =
    useState<SesionEstudio[]>(
      planInicial.sesiones,
    );

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    guardarPlanEstudio(cursoId, {
      configuracion,
      sesiones,
    });
  }, [cursoId, configuracion, sesiones]);

  function cambiarSemanaActual(
    valor: string,
  ) {
    const numero = Number(valor);

    if (
      Number.isInteger(numero) &&
      numero >= 1 &&
      numero <= 20
    ) {
      setConfiguracion((actual) => ({
        ...actual,
        semanaActual: numero,
      }));
    }
  }

  function cambiarHoras(valor: string) {
    const numero = Number(valor);

    if (
      Number.isFinite(numero) &&
      numero >= 1 &&
      numero <= 40
    ) {
      setConfiguracion((actual) => ({
        ...actual,
        horasSemanales: numero,
      }));
    }
  }

  function cambiarDuracion(
    valor: string,
  ) {
    const numero = Number(valor);

    if (
      [30, 45, 60, 90].includes(numero)
    ) {
      setConfiguracion((actual) => ({
        ...actual,
        duracionSesion: numero,
      }));
    }
  }

  function alternarDia(dia: DiaSemana) {
    setConfiguracion((actual) => {
      const yaSeleccionado =
        actual.diasDisponibles.includes(dia);

      return {
        ...actual,
        diasDisponibles: yaSeleccionado
          ? actual.diasDisponibles.filter(
              (diaGuardado) =>
                diaGuardado !== dia,
            )
          : [
              ...actual.diasDisponibles,
              dia,
            ],
      };
    });
  }

  function generarPlan() {
    if (
      configuracion.diasDisponibles
        .length === 0
    ) {
      setMensaje(
        "Selecciona al menos un día disponible.",
      );
      return;
    }

    const planGenerado =
      generarPlanEstudio(
        cursoId,
        temario,
        actividades,
        componentes,
        configuracion,
      );

    if (planGenerado.length === 0) {
      setMensaje(
        "No hay actividades ni temas pendientes para planificar.",
      );
      return;
    }

    setSesiones(planGenerado);
    setMensaje(
      `Se generaron ${planGenerado.length} sesiones priorizadas para ${nombreCurso}.`,
    );
  }

  function alternarEstadoSesion(
    sesionId: string,
  ) {
    setSesiones((actuales) =>
      actuales.map((sesion) =>
        sesion.id === sesionId
          ? {
              ...sesion,
              estado:
                sesion.estado ===
                "Completada"
                  ? "Pendiente"
                  : "Completada",
            }
          : sesion,
      ),
    );
  }

  function limpiarPlan() {
    const confirmar = window.confirm(
      "¿Deseas eliminar el plan de estudio generado para este curso?",
    );

    if (!confirmar) {
      return;
    }

    setSesiones([]);
    setMensaje("Plan eliminado.");
  }

  const sesionesCompletadas =
    sesiones.filter(
      (sesion) =>
        sesion.estado === "Completada",
    ).length;

  const sesionesAltaPrioridad =
    sesiones.filter(
      (sesion) =>
        sesion.prioridad === "Alta",
    ).length;

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Organización inteligente</p>
          <h2>Plan de estudio</h2>
        </div>

        <button
          type="button"
          onClick={generarPlan}
        >
          Generar plan inteligente
        </button>
      </div>

      <article className="next-activity">
        <p>Curso seleccionado</p>
        <h2>{nombreCurso}</h2>
        <span>
          UniRuta prioriza cercanía de la
          evaluación, peso en la nota final y
          temas atrasados.
        </span>
      </article>

      <section className="activity-form">
        <h3>Configuración semanal</h3>

        <div className="form-grid">
          <label className="form-field">
            <span>Semana actual</span>

            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={
                configuracion.semanaActual
              }
              onChange={(event) =>
                cambiarSemanaActual(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="form-field">
            <span>
              Horas disponibles por semana
            </span>

            <input
              type="number"
              min="1"
              max="40"
              step="1"
              value={
                configuracion.horasSemanales
              }
              onChange={(event) =>
                cambiarHoras(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="form-field">
            <span>
              Duración de cada sesión
            </span>

            <select
              value={
                configuracion.duracionSesion
              }
              onChange={(event) =>
                cambiarDuracion(
                  event.target.value,
                )
              }
            >
              <option value="30">
                30 minutos
              </option>
              <option value="45">
                45 minutos
              </option>
              <option value="60">
                60 minutos
              </option>
              <option value="90">
                90 minutos
              </option>
            </select>
          </label>
        </div>

        <div className="grade-input-grid">
          {dias.map((dia) => (
            <label
              className="grade-input-field"
              key={dia}
            >
              <span>{dia}</span>

              <input
                type="checkbox"
                checked={configuracion.diasDisponibles.includes(
                  dia,
                )}
                onChange={() =>
                  alternarDia(dia)
                }
              />
            </label>
          ))}
        </div>
      </section>

      {mensaje && (
        <p className="notes-mode-message">
          {mensaje}
        </p>
      )}

      {sesiones.length === 0 ? (
        <article className="next-activity">
          <p>Plan semanal</p>
          <h2>
            Todavía no hay sesiones generadas
          </h2>
          <span>
            Indica la semana actual, configura
            tu disponibilidad y genera el plan.
          </span>
        </article>
      ) : (
        <>
          <article className="next-activity">
            <p>Avance del plan</p>
            <h2>
              {sesionesCompletadas} de{" "}
              {sesiones.length} sesiones
              completadas
            </h2>
            <span>
              {sesionesAltaPrioridad} sesiones
              tienen prioridad alta.
            </span>
          </article>

          <div className="activities-list">
            {sesiones.map((sesion) => (
              <article
                className="activity-card"
                key={sesion.id}
              >
                <div>
                  <h3>
                    {sesion.titulo}
                  </h3>

                  <p>{sesion.detalle}</p>

                  <p>
                    <strong>
                      Prioridad{" "}
                      {sesion.prioridad}:
                    </strong>{" "}
                    {sesion.motivoPrioridad}
                  </p>

                  <div className="activity-meta">
                    <span>{sesion.dia}</span>

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
                    className="activity-status-button"
                    onClick={() =>
                      alternarEstadoSesion(
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
            ))}
          </div>

          <button
            type="button"
            className="delete-activity-button"
            onClick={limpiarPlan}
          >
            Eliminar plan
          </button>
        </>
      )}
    </section>
  );
}

export default PlanEstudioCurso;