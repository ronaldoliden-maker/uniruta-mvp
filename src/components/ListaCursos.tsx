import type { FormEvent } from "react";

import FormularioCurso from "./FormularioCurso";
import TarjetaCurso from "./TarjetaCurso";

type DatosCursoPanel = {
  id: string;
  nombre: string;
  codigo: string;
  ciclo: string;
  promedio: string;
  pendientes: number;
  proximaActividad: string;
};

type ListaCursosProps = {
  cursos: DatosCursoPanel[];

  mostrarFormulario: boolean;
  cursoEditandoId: string | null;

  nombreCurso: string;
  codigoCurso: string;
  cicloCurso: string;
  notaMinimaCurso: string;

  onCambiarNombre: (valor: string) => void;
  onCambiarCodigo: (valor: string) => void;
  onCambiarCiclo: (valor: string) => void;
  onCambiarNotaMinima: (valor: string) => void;

  onAbrirFormularioNuevo: () => void;
  onGuardarCurso: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onCancelarFormulario: () => void;

  onAbrirCurso: (cursoId: string) => void;
  onEditarCurso: (cursoId: string) => void;
  onEliminarCurso: (cursoId: string) => void;
};

function ListaCursos({
  cursos,

  mostrarFormulario,
  cursoEditandoId,

  nombreCurso,
  codigoCurso,
  cicloCurso,
  notaMinimaCurso,

  onCambiarNombre,
  onCambiarCodigo,
  onCambiarCiclo,
  onCambiarNotaMinima,

  onAbrirFormularioNuevo,
  onGuardarCurso,
  onCancelarFormulario,

  onAbrirCurso,
  onEditarCurso,
  onEliminarCurso,
}: ListaCursosProps) {
  return (
    <section className="courses-section">
      <div className="courses-section-heading">
        <h2>Mis cursos</h2>

        <button
          type="button"
          onClick={onAbrirFormularioNuevo}
        >
          + Agregar curso
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioCurso
          cursoEditandoId={cursoEditandoId}
          nombre={nombreCurso}
          codigo={codigoCurso}
          ciclo={cicloCurso}
          notaMinima={notaMinimaCurso}
          onCambiarNombre={onCambiarNombre}
          onCambiarCodigo={onCambiarCodigo}
          onCambiarCiclo={onCambiarCiclo}
          onCambiarNotaMinima={onCambiarNotaMinima}
          onGuardar={onGuardarCurso}
          onCancelar={onCancelarFormulario}
        />
      )}

      {cursos.length === 0 ? (
        <article className="next-activity">
          <p>Cursos</p>
          <h2>Todavía no tienes cursos registrados</h2>
          <span>
            Agrega tu primer curso para comenzar a organizar el ciclo.
          </span>
        </article>
      ) : (
        <div className="course-list">
          {cursos.map((curso) => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              onAbrir={onAbrirCurso}
              onEditar={onEditarCurso}
              onEliminar={onEliminarCurso}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ListaCursos;