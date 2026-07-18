import {
  useEffect,
  useState,
} from "react";

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

import {
  esSesionAtrasada,
  formatearFechaLarga,
  obtenerDiaDeFecha,
  reprogramarSesionesAtrasadas,
} from "../utils/fechasPlanEstudio";

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

  const [
    configuracion,
    setConfiguracion,
  ] =
    useState<ConfiguracionPlanEstudio>(
      planInicial.configuracion,
    );

  const [sesiones, setSesiones] =
    useState<SesionEstudio[]>(
      planInicial.sesiones,
    );

  const [mensaje, setMensaje] =
    useState("");

  const [
    sesionEditandoId,
    setSesionEditandoId,
  ] = useState<string | null>(null);

  const [
    fechaSesionEditada,
    setFechaSesionEditada,
  ] = useState("");

  const [
    duracionSesionEditada,
    setDuracionSesionEditada,
  ] = useState("60");

  useEffect(() => {
    guardarPlanEstudio(cursoId, {
      configuracion,
      sesiones,
    });
  }, [
    cursoId,
    configuracion,
    sesiones,
  ]);

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

  function cambiarFechaInicio(
    valor: string,
  ) {
    if (!valor) {
      return;
    }

    setConfiguracion((actual) => ({
      ...actual,
      fechaInicio: valor,
    }));
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
      [30, 45, 60, 90].includes(
        numero,
      )
    ) {
      setConfiguracion((actual) => ({
        ...actual,
        duracionSesion: numero,
      }));
    }
  }

  function alternarDia(
    dia: DiaSemana,
  ) {
    setConfiguracion((actual) => {
      const yaSeleccionado =
        actual.diasDisponibles.includes(
          dia,
        );

      return {
        ...actual,
        diasDisponibles:
          yaSeleccionado
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
      `Se generaron ${planGenerado.length} sesiones con fechas reales para ${nombreCurso}.`,
    );
  }

  function reprogramarAtrasadas() {
    const resultado =
      reprogramarSesionesAtrasadas(
        sesiones,
        configuracion.diasDisponibles,
      );

    if (
      resultado.cantidadReprogramada ===
      0
    ) {
      setMensaje(
        "No existen sesiones atrasadas para reprogramar.",
      );
      return;
    }

    setSesiones(resultado.sesiones);

    setMensaje(
      `Se reprogramaron ${resultado.cantidadReprogramada} sesiones atrasadas.`,
    );
  }

  function abrirEdicionSesion(
    sesion: SesionEstudio,
  ) {
    setSesionEditandoId(sesion.id);
    setFechaSesionEditada(sesion.fecha);
    setDuracionSesionEditada(
      String(sesion.duracionMinutos),
    );
    setMensaje("");
  }

  function cancelarEdicionSesion() {
    setSesionEditandoId(null);
    setFechaSesionEditada("");
    setDuracionSesionEditada("60");
  }

  function guardarEdicionSesion(
    sesionId: string,
  ) {
    const duracion = Number(
      duracionSesionEditada,
    );

    if (!fechaSesionEditada) {
      setMensaje(
        "Selecciona una fecha válida para la sesión.",
      );
      return;
    }

    if (
      !Number.isInteger(duracion) ||
      duracion < 15 ||
      duracion > 240
    ) {
      setMensaje(
        "La duración debe estar entre 15 y 240 minutos.",
      );
      return;
    }

    setSesiones((sesionesActuales) =>
      sesionesActuales.map((sesion) => {
        if (sesion.id !== sesionId) {
          return sesion;
        }

        const cambioFecha =
          sesion.fecha !==
          fechaSesionEditada;

        return {
          ...sesion,
          fecha: fechaSesionEditada,
          dia: obtenerDiaDeFecha(
            fechaSesionEditada,
          ),
          duracionMinutos: duracion,
          reprogramada:
            cambioFecha
              ? true
              : sesion.reprogramada,
          fechaOriginal:
            cambioFecha
              ? sesion.fechaOriginal ??
                sesion.fecha
              : sesion.fechaOriginal,
        };
      }),
    );

    cancelarEdicionSesion();

    setMensaje(
      "La sesión se actualizó correctamente.",
    );
  }

  function eliminarSesion(
    sesionId: string,
  ) {
    const sesion = sesiones.find(
      (sesionGuardada) =>
        sesionGuardada.id === sesionId,
    );

    if (!sesion) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar la sesión "${sesion.titulo}"?`,
    );

    if (!confirmar) {
      return;
    }

    setSesiones((sesionesActuales) =>
      sesionesActuales.filter(
        (sesionGuardada) =>
          sesionGuardada.id !== sesionId,
      ),
    );

    if (
      sesionEditandoId === sesionId
    ) {
      cancelarEdicionSesion();
    }

    setMensaje("Sesión eliminada.");
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
        sesion.estado ===
        "Completada",
    ).length;

  const sesionesAltaPrioridad =
    sesiones.filter(
      (sesion) =>
        sesion.estado === "Pendiente" &&
        sesion.prioridad === "Alta",
    ).length;

  const sesionesAtrasadas =
    sesiones.filter(
      esSesionAtrasada,
    ).length;

  const sesionesOrdenadas = [
    ...sesiones,
  ].sort((sesionA, sesionB) =>
    sesionA.fecha.localeCompare(
      sesionB.fecha,
    ),
  );

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>
            Organización inteligente
          </p>
          <h2>Plan de estudio</h2>
        </div>

        <div className="activity-actions">
          {sesionesAtrasadas > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={
                reprogramarAtrasadas
              }
            >
              Reprogramar atrasadas
            </button>
          )}

          <button
            type="button"
            onClick={generarPlan}
          >
            Generar plan inteligente
          </button>
        </div>
      </div>

      <article className="next-activity">
        <p>Curso seleccionado</p>
        <h2>{nombreCurso}</h2>
        <span>
          Las sesiones reciben una fecha
          real y las pendientes vencidas
          pueden moverse automáticamente.
        </span>
      </article>

      <section className="activity-form">
        <h3>
          Configuración semanal
        </h3>

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
              Comenzar el plan desde
            </span>

            <input
              type="date"
              value={
                configuracion.fechaInicio
              }
              onChange={(event) =>
                cambiarFechaInicio(
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
            Todavía no hay sesiones
            generadas
          </h2>
          <span>
            Configura la fecha, tus días y
            tus horas disponibles.
          </span>
        </article>
      ) : (
        <>
          <div className="course-summary-grid">
            <article className="summary-card">
              <strong>
                {sesionesCompletadas}
              </strong>
              <span>
                Sesiones completadas
              </span>
            </article>

            <article className="summary-card">
              <strong>
                {sesionesAltaPrioridad}
              </strong>
              <span>Prioridad alta</span>
            </article>

            <article className="summary-card">
              <strong>
                {sesionesAtrasadas}
              </strong>
              <span>Sesiones atrasadas</span>
            </article>

            <article className="summary-card">
              <strong>
                {sesiones.length}
              </strong>
              <span>Total planificado</span>
            </article>
          </div>

          <div className="activities-list">
            {sesionesOrdenadas.map(
              (sesion) => (
                <article
                  className="activity-card"
                  key={sesion.id}
                >
                  <div>
                    <p>
                      {formatearFechaLarga(
                        sesion.fecha,
                      )}
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
                        {sesion.prioridad}:
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
                        {sesion.fechaOriginal
                          ? ` desde ${formatearFechaLarga(
                              sesion.fechaOriginal,
                            )}`
                          : ""}
                      </p>
                    )}

                    <div className="activity-meta">
                      <span>
                        {sesion.dia}
                      </span>

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

                      {esSesionAtrasada(
                        sesion,
                      ) && (
                        <span>
                          Atrasada
                        </span>
                      )}

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

                    {sesionEditandoId ===
                      sesion.id && (
                      <section className="activity-form">
                        <h3>
                          Editar sesión
                        </h3>

                        <div className="form-grid">
                          <label className="form-field">
                            <span>
                              Nueva fecha
                            </span>

                            <input
                              type="date"
                              value={
                                fechaSesionEditada
                              }
                              onChange={(event) =>
                                setFechaSesionEditada(
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span>
                              Duración en minutos
                            </span>

                            <input
                              type="number"
                              min="15"
                              max="240"
                              step="15"
                              value={
                                duracionSesionEditada
                              }
                              onChange={(event) =>
                                setDuracionSesionEditada(
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>

                        <div className="activity-actions">
                          <button
                            type="button"
                            onClick={() =>
                              guardarEdicionSesion(
                                sesion.id,
                              )
                            }
                          >
                            Guardar cambios
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={
                              cancelarEdicionSesion
                            }
                          >
                            Cancelar
                          </button>
                        </div>
                      </section>
                    )}
                  </div>

                  <div className="activity-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        abrirEdicionSesion(
                          sesion,
                        )
                      }
                    >
                      Mover o editar
                    </button>

                    <button
                      type="button"
                      className="delete-activity-button"
                      onClick={() =>
                        eliminarSesion(
                          sesion.id,
                        )
                      }
                    >
                      Eliminar
                    </button>

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
              ),
            )}
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