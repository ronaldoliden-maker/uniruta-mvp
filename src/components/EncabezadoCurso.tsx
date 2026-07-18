import type { Curso } from "../types/academico";

type EncabezadoCursoProps = {
  curso: Curso;
};

function EncabezadoCurso({
  curso,
}: EncabezadoCursoProps) {
  const estadoVisible =
    curso.estado === "en_curso"
      ? "En curso"
      : curso.estado === "completado"
        ? "Completado"
        : "Archivado";

  return (
    <div className="course-heading">
      <p>Curso</p>

      <h1>{curso.nombre}</h1>

      <span>{estadoVisible}</span>
    </div>
  );
}

export default EncabezadoCurso;