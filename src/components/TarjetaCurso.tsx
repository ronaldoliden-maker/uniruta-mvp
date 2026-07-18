type DatosCurso = {
    id: string;
    nombre: string;
    codigo: string;
    ciclo: string;
    promedio: string;
    pendientes: number;
    proximaActividad: string;
  };
  
  type TarjetaCursoProps = {
    curso: DatosCurso;
    onAbrir: (cursoId: string) => void;
    onEditar: (cursoId: string) => void;
    onEliminar: (cursoId: string) => void;
  };
  
  function TarjetaCurso({
    curso,
    onAbrir,
    onEditar,
    onEliminar,
  }: TarjetaCursoProps) {
    return (
      <article className="course-card">
        <div>
          <h3>{curso.nombre}</h3>
  
          <p>
            {curso.codigo} · Ciclo {curso.ciclo}
          </p>
  
          <p>Promedio evaluado: {curso.promedio}</p>
  
          <p>Pendientes: {curso.pendientes}</p>
  
          <p>
            Próxima actividad: {curso.proximaActividad}
          </p>
        </div>
  
        <div className="activity-actions">
          <button
            type="button"
            onClick={() => onAbrir(curso.id)}
          >
            Abrir curso
          </button>
  
          <button
            type="button"
            className="edit-activity-button"
            onClick={() => onEditar(curso.id)}
          >
            Editar
          </button>
  
          <button
            type="button"
            className="delete-activity-button"
            onClick={() => onEliminar(curso.id)}
          >
            Eliminar
          </button>
        </div>
      </article>
    );
  }
  
  export default TarjetaCurso;