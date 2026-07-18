import type { ComponenteNota } from "../types/academico";
import type { NotasPorId } from "../utils/calcularNotas";

type ModoNotas = "oficial" | "simulacion";

type CalculadoraNotasCursoProps = {
  modo: ModoNotas;
  evaluaciones: ComponenteNota[];

  notasOficiales: NotasPorId;
  notasEnFormulario: NotasPorId;

  notaFinalOficial: number;
  notaFinalMostrada: number;
  diferenciaSimulada: number;

  onActivarOficial: () => void;
  onActivarSimulacion: () => void;

  onActualizarNota: (
    evaluacionId: string,
    valor: string,
    notaMaxima: number,
  ) => void;

  onRestablecerSimulacion: () => void;
};

function tieneNota(
  valor: number | string | undefined,
) {
  return valor !== "" && valor !== undefined;
}

function CalculadoraNotasCurso({
  modo,
  evaluaciones,

  notasOficiales,
  notasEnFormulario,

  notaFinalOficial,
  notaFinalMostrada,
  diferenciaSimulada,

  onActivarOficial,
  onActivarSimulacion,
  onActualizarNota,
  onRestablecerSimulacion,
}: CalculadoraNotasCursoProps) {
  return (
    <section className="dynamic-evaluations-check">
      <div className="dynamic-evaluations-heading">
        <div>
          <p>Calculadora dinámica</p>

          <h3>
            {modo === "oficial"
              ? "Mis notas oficiales"
              : "Simulador de notas"}
          </h3>
        </div>

        <strong>
          {evaluaciones.length} evaluaciones
        </strong>
      </div>

      <div className="notes-mode-switch">
        <button
          type="button"
          className={
            modo === "oficial"
              ? "notes-mode-button active-notes-mode"
              : "notes-mode-button"
          }
          onClick={onActivarOficial}
        >
          Notas oficiales
        </button>

        <button
          type="button"
          className={
            modo === "simulacion"
              ? "notes-mode-button active-notes-mode"
              : "notes-mode-button"
          }
          onClick={onActivarSimulacion}
        >
          Simulador
        </button>
      </div>

      <div className="simulation-summary">
        <article>
          <span>Nota final oficial</span>

          <strong>
            {notaFinalOficial.toFixed(2)}
          </strong>
        </article>

        {modo === "simulacion" && (
          <>
            <article>
              <span>Nota final simulada</span>

              <strong>
                {notaFinalMostrada.toFixed(2)}
              </strong>
            </article>

            <article>
              <span>Cambio estimado</span>

              <strong>
                {diferenciaSimulada >= 0 ? "+" : ""}
                {diferenciaSimulada.toFixed(2)}
              </strong>
            </article>
          </>
        )}
      </div>

      {modo === "oficial" ? (
        <p className="notes-mode-message">
          Ingresa únicamente las notas que ya fueron
          publicadas. Estas notas se guardarán al cerrar o
          recargar la aplicación.
        </p>
      ) : (
        <p className="notes-mode-message simulation-message">
          Las notas oficiales están bloqueadas. Completa
          solamente las evaluaciones pendientes para probar
          resultados. La simulación no se guardará.
        </p>
      )}

      {evaluaciones.length === 0 ? (
        <article className="next-activity">
          <p>Notas</p>

          <h2>No existen evaluaciones configuradas</h2>

          <span>
            Primero agrega los componentes desde la pestaña
            Evaluación.
          </span>
        </article>
      ) : (
        <div className="grade-input-grid">
          {evaluaciones.map((evaluacion) => {
            const notaMaxima =
              evaluacion.notaMaxima ?? 20;

            const valorOficial =
              notasOficiales[evaluacion.id];

            const tieneNotaOficial =
              tieneNota(valorOficial);

            const valorActivo =
              notasEnFormulario[evaluacion.id] ?? "";

            const tieneNotaSimulada =
              modo === "simulacion" &&
              !tieneNotaOficial &&
              tieneNota(valorActivo);

            const campoBloqueado =
              modo === "simulacion" &&
              tieneNotaOficial;

            return (
              <label
                className="grade-input-field"
                key={evaluacion.id}
              >
                <div className="dynamic-note-heading">
                  <span>{evaluacion.nombre}</span>

                  <small
                    className={
                      tieneNotaOficial
                        ? "note-origin official-note"
                        : tieneNotaSimulada
                          ? "note-origin simulated-note"
                          : "note-origin pending-note"
                    }
                  >
                    {tieneNotaOficial
                      ? "Oficial"
                      : tieneNotaSimulada
                        ? "Simulada"
                        : "Pendiente"}
                  </small>
                </div>

                <input
                  type="number"
                  min="0"
                  max={notaMaxima}
                  step="0.01"
                  value={String(valorActivo)}
                  disabled={campoBloqueado}
                  onChange={(event) =>
                    onActualizarNota(
                      evaluacion.id,
                      event.target.value,
                      notaMaxima,
                    )
                  }
                  placeholder={`0 a ${notaMaxima}`}
                />

                <small>
                  Máximo: {notaMaxima}
                </small>
              </label>
            );
          })}
        </div>
      )}

      {modo === "simulacion" && (
        <button
          type="button"
          className="reset-simulation-button"
          onClick={onRestablecerSimulacion}
        >
          Restablecer simulación
        </button>
      )}
    </section>
  );
}

export default CalculadoraNotasCurso;