import type { FormEvent } from "react";
import type { Actividad } from "../types/actividad";

type ActividadesCursoProps = {
  actividades: Actividad[];

  mostrarFormulario: boolean;
  actividadEditandoId: number | null;

  nombreActividad: string;
  tipoActividad: string;
  semanaActividad: string;
  fechaActividad: string;

  onCambiarNombre: (valor: string) => void;
  onCambiarTipo: (valor: string) => void;
  onCambiarSemana: (valor: string) => void;
  onCambiarFecha: (valor: string) => void;

  onAbrirNueva: () => void;
  onCancelar: () => void;
  onGuardar: (event: FormEvent<HTMLFormElement>) => void;

  onCambiarEstado: (actividadId: number) => void;
  onEditar: (actividadId: number) => void;
  onEliminar: (actividadId: number) => void;
};

function ActividadesCurso({
  actividades,

  mostrarFormulario,
  actividadEditandoId,

  nombreActividad,
  tipoActividad,
  semanaActividad,
  fechaActividad,

  onCambiarNombre,
  onCambiarTipo,
  onCambiarSemana,
  onCambiarFecha,

  onAbrirNueva,
  onCancelar,
  onGuardar,

  onCambiarEstado,
  onEditar,
  onEliminar,
}: ActividadesCursoProps) {
  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Organización del curso</p>
          <h2>Actividades</h2>
        </div>

        <button type="button" onClick={onAbrirNueva}>
          + Agregar actividad
        </button>
      </div>

      {mostrarFormulario && (
        <form className="activity-form" onSubmit={onGuardar}>
          <h3>
            {actividadEditandoId !== null
              ? "Editar actividad"
              : "Nueva actividad"}
          </h3>

          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>

              <input
                type="text"
                value={nombreActividad}
                onChange={(event) =>
                  onCambiarNombre(event.target.value)
                }
                placeholder="Ejemplo: Quiz 1"
                required
              />
            </label>

            <label className="form-field">
              <span>Tipo</span>

              <select
                value={tipoActividad}
                onChange={(event) =>
                  onCambiarTipo(event.target.value)
                }
              >
                <option>Evaluación en aula</option>
                <option>Tarea</option>
                <option>Resolución de casos</option>
                <option>Proyecto</option>
                <option>Examen</option>
                <option>Reunión</option>
                <option>Sesión de estudio</option>
              </select>
            </label>

            <label className="form-field">
              <span>Semana</span>

              <input
                type="number"
                min="1"
                max="16"
                value={semanaActividad}
                onChange={(event) =>
                  onCambiarSemana(event.target.value)
                }
                placeholder="1"
                required
              />
            </label>

            <label className="form-field">
              <span>Fecha exacta opcional</span>

              <input
                type="date"
                value={fechaActividad}
                onChange={(event) =>
                  onCambiarFecha(event.target.value)
                }
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancelar}
            >
              Cancelar
            </button>

            <button type="submit">
              {actividadEditandoId !== null
                ? "Guardar cambios"
                : "Guardar actividad"}
            </button>
          </div>
        </form>
      )}

      {actividades.length === 0 ? (
        <article className="next-activity">
          <p>Actividades</p>

          <h2>Todavía no hay actividades registradas</h2>

          <span>
            Agrega tareas, evaluaciones, proyectos o sesiones de estudio.
          </span>
        </article>
      ) : (
        <div className="activities-list">
          {actividades.map((actividad) => (
            <article
              className="activity-card"
              key={actividad.id}
            >
              <div>
                <h3>{actividad.nombre}</h3>
                <p>{actividad.tipo}</p>

                <div className="activity-meta">
                  <span>{actividad.semana}</span>
                  <span>{actividad.fecha}</span>
                </div>
              </div>

              <div className="activity-actions">
                <span
                  className={`status-badge ${
                    actividad.estado === "Completada"
                      ? "completed-status"
                      : ""
                  }`}
                >
                  {actividad.estado}
                </span>

                <button
                  type="button"
                  className="activity-status-button"
                  onClick={() =>
                    onCambiarEstado(actividad.id)
                  }
                >
                  {actividad.estado === "Completada"
                    ? "Reabrir"
                    : "Completar"}
                </button>

                <button
                  type="button"
                  className="edit-activity-button"
                  onClick={() =>
                    onEditar(actividad.id)
                  }
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="delete-activity-button"
                  onClick={() =>
                    onEliminar(actividad.id)
                  }
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ActividadesCurso;