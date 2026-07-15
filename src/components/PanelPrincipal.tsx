import type { FormEvent } from "react";

import ListaCursos from "./ListaCursos";
import ResumenGlobal from "./ResumenGlobal";

type DatosCursoPanel = {
  id: string;
  nombre: string;
  codigo: string;
  ciclo: string;
  promedio: string;
  pendientes: number;
  proximaActividad: string;
};

type PanelPrincipalProps = {
  pendientesGlobales: number;
  atrasadasGlobales: number;
  completadasGlobales: number;

  cursos: DatosCursoPanel[];

  mostrarFormularioCurso: boolean;
  cursoEditandoId: string | null;

  nombreCurso: string;
  codigoCurso: string;
  cicloCurso: string;
  notaMinimaCurso: string;

  onCambiarNombreCurso: (valor: string) => void;
  onCambiarCodigoCurso: (valor: string) => void;
  onCambiarCicloCurso: (valor: string) => void;
  onCambiarNotaMinimaCurso: (valor: string) => void;

  onAbrirFormularioNuevoCurso: () => void;
  onGuardarCurso: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onCancelarFormularioCurso: () => void;

  onAbrirCurso: (cursoId: string) => void;
  onEditarCurso: (cursoId: string) => void;
  onEliminarCurso: (cursoId: string) => void;

  onVolver: () => void;
};

function PanelPrincipal({
  pendientesGlobales,
  atrasadasGlobales,
  completadasGlobales,

  cursos,

  mostrarFormularioCurso,
  cursoEditandoId,

  nombreCurso,
  codigoCurso,
  cicloCurso,
  notaMinimaCurso,

  onCambiarNombreCurso,
  onCambiarCodigoCurso,
  onCambiarCicloCurso,
  onCambiarNotaMinimaCurso,

  onAbrirFormularioNuevoCurso,
  onGuardarCurso,
  onCancelarFormularioCurso,

  onAbrirCurso,
  onEditarCurso,
  onEliminarCurso,

  onVolver,
}: PanelPrincipalProps) {
  return (
    <section className="welcome">
      <p>Semana actual</p>

      <h1>Semana 1 de 16</h1>

      <p>
        Aquí aparecerá el resumen de tus actividades,
        cursos y evaluaciones.
      </p>

      <ResumenGlobal
        pendientes={pendientesGlobales}
        atrasadas={atrasadasGlobales}
        completadas={completadasGlobales}
      />

      <ListaCursos
        cursos={cursos}
        mostrarFormulario={mostrarFormularioCurso}
        cursoEditandoId={cursoEditandoId}
        nombreCurso={nombreCurso}
        codigoCurso={codigoCurso}
        cicloCurso={cicloCurso}
        notaMinimaCurso={notaMinimaCurso}
        onCambiarNombre={onCambiarNombreCurso}
        onCambiarCodigo={onCambiarCodigoCurso}
        onCambiarCiclo={onCambiarCicloCurso}
        onCambiarNotaMinima={
          onCambiarNotaMinimaCurso
        }
        onAbrirFormularioNuevo={
          onAbrirFormularioNuevoCurso
        }
        onGuardarCurso={onGuardarCurso}
        onCancelarFormulario={
          onCancelarFormularioCurso
        }
        onAbrirCurso={onAbrirCurso}
        onEditarCurso={onEditarCurso}
        onEliminarCurso={onEliminarCurso}
      />

      <button
        type="button"
        className="secondary-button"
        onClick={onVolver}
      >
        Volver
      </button>
    </section>
  );
}

export default PanelPrincipal;