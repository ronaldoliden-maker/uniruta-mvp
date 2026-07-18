import type { FormEvent } from "react";

type FormularioCursoProps = {
  cursoEditandoId: string | null;

  nombre: string;
  codigo: string;
  ciclo: string;
  notaMinima: string;

  onCambiarNombre: (valor: string) => void;
  onCambiarCodigo: (valor: string) => void;
  onCambiarCiclo: (valor: string) => void;
  onCambiarNotaMinima: (valor: string) => void;

  onGuardar: (event: FormEvent<HTMLFormElement>) => void;
  onCancelar: () => void;
};

function FormularioCurso({
  cursoEditandoId,

  nombre,
  codigo,
  ciclo,
  notaMinima,

  onCambiarNombre,
  onCambiarCodigo,
  onCambiarCiclo,
  onCambiarNotaMinima,

  onGuardar,
  onCancelar,
}: FormularioCursoProps) {
  return (
    <form className="activity-form" onSubmit={onGuardar}>
      <h3>
        {cursoEditandoId
          ? "Editar curso"
          : "Nuevo curso"}
      </h3>

      <div className="form-grid">
        <label className="form-field">
          <span>Nombre del curso</span>

          <input
            type="text"
            value={nombre}
            onChange={(event) =>
              onCambiarNombre(event.target.value)
            }
            placeholder="Ejemplo: Termodinámica"
            required
          />
        </label>

        <label className="form-field">
          <span>Código</span>

          <input
            type="text"
            value={codigo}
            onChange={(event) =>
              onCambiarCodigo(event.target.value)
            }
            placeholder="Ejemplo: TERMO"
            maxLength={12}
          />
        </label>

        <label className="form-field">
          <span>Ciclo</span>

          <input
            type="text"
            value={ciclo}
            onChange={(event) =>
              onCambiarCiclo(event.target.value)
            }
            placeholder="2026-1"
            required
          />
        </label>

        <label className="form-field">
          <span>Nota mínima</span>

          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={notaMinima}
            onChange={(event) =>
              onCambiarNotaMinima(event.target.value)
            }
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
          {cursoEditandoId
            ? "Guardar cambios"
            : "Guardar curso"}
        </button>
      </div>
    </form>
  );
}

export default FormularioCurso;