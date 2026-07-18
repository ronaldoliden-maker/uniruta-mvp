import type { FormEvent } from "react";
import type { TemaCurso } from "../types/tema";

type TemarioCursoProps = {
  temario: TemaCurso[];
  temasOrdenados: TemaCurso[];
  temasCompletados: number;

  mostrarFormulario: boolean;
  temaEditandoId: number | null;

  semanaTema: string;
  tituloTema: string;
  detalleTema: string;

  onCambiarSemana: (valor: string) => void;
  onCambiarTitulo: (valor: string) => void;
  onCambiarDetalle: (valor: string) => void;

  onAbrirNuevo: () => void;
  onCancelar: () => void;
  onGuardar: (event: FormEvent<HTMLFormElement>) => void;

  onCambiarEstado: (temaId: number) => void;
  onEditar: (temaId: number) => void;
  onEliminar: (temaId: number) => void;
};

function TemarioCurso({
  temario,
  temasOrdenados,
  temasCompletados,

  mostrarFormulario,
  temaEditandoId,

  semanaTema,
  tituloTema,
  detalleTema,

  onCambiarSemana,
  onCambiarTitulo,
  onCambiarDetalle,

  onAbrirNuevo,
  onCancelar,
  onGuardar,

  onCambiarEstado,
  onEditar,
  onEliminar,
}: TemarioCursoProps) {
  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Contenido del sílabo</p>
          <h2>Temario por semanas</h2>
        </div>

        <button type="button" onClick={onAbrirNuevo}>
          + Agregar tema
        </button>
      </div>

      <article className="next-activity">
        <p>Avance del temario</p>

        <h2>
          {temasCompletados} de {temario.length} temas completados
        </h2>

        <span>
          Registra los contenidos del curso para que UniRuta pueda organizar
          el estudio y relacionarlos con tus actividades.
        </span>
      </article>

      {mostrarFormulario && (
        <form className="activity-form" onSubmit={onGuardar}>
          <h3>
            {temaEditandoId !== null
              ? "Editar tema"
              : "Nuevo tema"}
          </h3>

          <div className="form-grid">
            <label className="form-field">
              <span>Semana</span>

              <input
                type="number"
                min="1"
                max="20"
                value={semanaTema}
                onChange={(event) =>
                  onCambiarSemana(event.target.value)
                }
                placeholder="Ejemplo: 4"
                required
              />
            </label>

            <label className="form-field">
              <span>Tema principal</span>

              <input
                type="text"
                value={tituloTema}
                onChange={(event) =>
                  onCambiarTitulo(event.target.value)
                }
                placeholder="Ejemplo: Primera ley de la termodinámica"
                required
              />
            </label>

            <label className="form-field">
              <span>Detalle opcional</span>

              <input
                type="text"
                value={detalleTema}
                onChange={(event) =>
                  onCambiarDetalle(event.target.value)
                }
                placeholder="Subtemas, capítulos o indicaciones"
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
              {temaEditandoId !== null
                ? "Guardar cambios"
                : "Guardar tema"}
            </button>
          </div>
        </form>
      )}

      {temasOrdenados.length === 0 ? (
        <article className="next-activity">
          <p>Temario</p>

          <h2>Todavía no hay temas registrados</h2>

          <span>
            Puedes copiarlos manualmente desde el sílabo. Más adelante la IA
            completará esta sección al leer el PDF.
          </span>
        </article>
      ) : (
        <div className="activities-list">
          {temasOrdenados.map((tema) => (
            <article
              className="activity-card"
              key={tema.id}
            >
              <div>
                <h3>{tema.titulo}</h3>

                <p>
                  {tema.detalle ||
                    "Sin detalle adicional"}
                </p>

                <div className="activity-meta">
                  <span>Semana {tema.semana}</span>

                  <span
                    className={`status-badge ${
                      tema.estado === "Completado"
                        ? "completed-status"
                        : ""
                    }`}
                  >
                    {tema.estado}
                  </span>
                </div>
              </div>

              <div className="activity-actions">
                <button
                  type="button"
                  className="activity-status-button"
                  onClick={() =>
                    onCambiarEstado(tema.id)
                  }
                >
                  {tema.estado === "Pendiente"
                    ? "Empezar"
                    : tema.estado === "En progreso"
                      ? "Completar"
                      : "Reabrir"}
                </button>

                <button
                  type="button"
                  className="edit-activity-button"
                  onClick={() =>
                    onEditar(tema.id)
                  }
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="delete-activity-button"
                  onClick={() =>
                    onEliminar(tema.id)
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

export default TemarioCurso;