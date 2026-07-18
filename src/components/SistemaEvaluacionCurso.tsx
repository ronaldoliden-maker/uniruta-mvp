import type { FormEvent } from "react";
import type { ComponenteNota } from "../types/academico";

type SistemaEvaluacionCursoProps = {
  componentes: ComponenteNota[];
  pesoTotal: number;

  mostrarFormulario: boolean;
  componenteEditandoId: string | null;

  nombreComponente: string;
  pesoComponente: string;
  notaMaximaComponente: string;

  onCambiarNombre: (valor: string) => void;
  onCambiarPeso: (valor: string) => void;
  onCambiarNotaMaxima: (valor: string) => void;

  onAbrirNuevo: () => void;
  onCancelar: () => void;
  onGuardar: (event: FormEvent<HTMLFormElement>) => void;

  onEditar: (componenteId: string) => void;
  onEliminar: (componenteId: string) => void;
};

function SistemaEvaluacionCurso({
  componentes,
  pesoTotal,

  mostrarFormulario,
  componenteEditandoId,

  nombreComponente,
  pesoComponente,
  notaMaximaComponente,

  onCambiarNombre,
  onCambiarPeso,
  onCambiarNotaMaxima,

  onAbrirNuevo,
  onCancelar,
  onGuardar,

  onEditar,
  onEliminar,
}: SistemaEvaluacionCursoProps) {
  const componenteEditando = componentes.find(
    (componente) =>
      componente.id === componenteEditandoId,
  );

  const notaMaximaBloqueada =
    componenteEditandoId !== null &&
    componenteEditando?.tipo !== "nota_directa";

  const sistemaCompleto =
    Math.abs(pesoTotal - 100) < 0.001;

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Configuración académica</p>
          <h2>Sistema de evaluación</h2>
        </div>

        <button
          type="button"
          onClick={onAbrirNuevo}
        >
          + Agregar evaluación
        </button>
      </div>

      <article className="next-activity">
        <p>Peso total configurado</p>

        <h2>
          {pesoTotal.toFixed(2)} % de 100 %
        </h2>

        <span>
          {sistemaCompleto
            ? "El sistema de evaluación está completo."
            : pesoTotal < 100
              ? `Todavía falta asignar ${(
                  100 - pesoTotal
                ).toFixed(2)} %.`
              : "El peso total supera 100 %."}
        </span>
      </article>

      <p className="notes-mode-message">
        Este editor básico permite crear evaluaciones
        directas como parciales, finales, prácticas y
        proyectos. Las fórmulas compuestas existentes,
        como EC1 y EC2, se conservan.
      </p>

      {mostrarFormulario && (
        <form
          className="activity-form"
          onSubmit={onGuardar}
        >
          <h3>
            {componenteEditandoId
              ? "Editar componente"
              : "Nueva evaluación"}
          </h3>

          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>

              <input
                type="text"
                value={nombreComponente}
                onChange={(event) =>
                  onCambiarNombre(event.target.value)
                }
                placeholder="Ejemplo: Examen parcial"
                required
              />
            </label>

            <label className="form-field">
              <span>Peso en la nota final (%)</span>

              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={pesoComponente}
                onChange={(event) =>
                  onCambiarPeso(event.target.value)
                }
                placeholder="Ejemplo: 30"
                required
              />
            </label>

            <label className="form-field">
              <span>Nota máxima</span>

              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={notaMaximaComponente}
                onChange={(event) =>
                  onCambiarNotaMaxima(
                    event.target.value,
                  )
                }
                disabled={notaMaximaBloqueada}
                required
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
              {componenteEditandoId
                ? "Guardar cambios"
                : "Guardar evaluación"}
            </button>
          </div>
        </form>
      )}

      {componentes.length === 0 ? (
        <article className="next-activity">
          <p>Sistema de evaluación</p>

          <h2>
            Todavía no hay evaluaciones registradas
          </h2>

          <span>
            Agrega los componentes indicados en el sílabo
            del curso.
          </span>
        </article>
      ) : (
        <div className="activities-list">
          {componentes.map((componente) => (
            <article
              className="activity-card"
              key={componente.id}
            >
              <div>
                <h3>{componente.nombre}</h3>

                <p>
                  {componente.tipo === "nota_directa"
                    ? "Evaluación directa"
                    : "Fórmula compuesta"}
                </p>

                <div className="activity-meta">
                  <span>
                    Peso: {componente.peso ?? 0} %
                  </span>

                  {componente.tipo ===
                    "nota_directa" && (
                    <span>
                      Nota máxima:{" "}
                      {componente.notaMaxima ?? 20}
                    </span>
                  )}

                  {componente.hijos &&
                    componente.hijos.length > 0 && (
                      <span>
                        {componente.hijos.length} componentes
                        internos
                      </span>
                    )}
                </div>
              </div>

              <div className="activity-actions">
                <button
                  type="button"
                  className="edit-activity-button"
                  onClick={() =>
                    onEditar(componente.id)
                  }
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="delete-activity-button"
                  onClick={() =>
                    onEliminar(componente.id)
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

export default SistemaEvaluacionCurso;