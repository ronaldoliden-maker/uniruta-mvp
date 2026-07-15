export type PestanaCurso =
  | "resumen"
  | "silabo"
  | "temario"
  | "actividades"
  | "notas"
  | "configuracion";

type NavegacionCursoProps = {
  pestanaActiva: PestanaCurso;
  onCambiar: (pestana: PestanaCurso) => void;
};

function NavegacionCurso({
  pestanaActiva,
  onCambiar,
}: NavegacionCursoProps) {
  return (
    <nav className="course-tabs">
      <button
        type="button"
        className={
          pestanaActiva === "resumen"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("resumen")}
      >
        Resumen
      </button>

      <button
        type="button"
        className={
          pestanaActiva === "silabo"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("silabo")}
      >
        Sílabo
      </button> 

      <button
        type="button"
        className={
          pestanaActiva === "temario"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("temario")}
      >
        Temario
      </button>

      <button
        type="button"
        className={
          pestanaActiva === "actividades"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("actividades")}
      >
        Actividades
      </button>

      <button
        type="button"
        className={
          pestanaActiva === "notas"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("notas")}
      >
        Notas
      </button>

      <button
        type="button"
        className={
          pestanaActiva === "configuracion"
            ? "active-tab"
            : ""
        }
        onClick={() => onCambiar("configuracion")}
      >
        Evaluación
      </button>

      <button type="button" disabled>
        Calendario
      </button>
    </nav>
  );
}

export default NavegacionCurso;