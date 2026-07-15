import {
    useState,
    type ChangeEvent,
  } from "react";
  
  type ImportarSilaboCursoProps = {
    nombreCurso: string;
  };
  
  function formatearTamano(bytes: number) {
    const megabytes = bytes / 1024 / 1024;
  
    return `${megabytes.toFixed(2)} MB`;
  }
  
  function ImportarSilaboCurso({
    nombreCurso,
  }: ImportarSilaboCursoProps) {
    const [archivo, setArchivo] =
      useState<File | null>(null);
  
    const [mensajeError, setMensajeError] =
      useState("");
  
    function seleccionarArchivo(
      event: ChangeEvent<HTMLInputElement>,
    ) {
      const archivoSeleccionado =
        event.target.files?.[0];
  
      if (!archivoSeleccionado) {
        return;
      }
  
      const esPdf =
        archivoSeleccionado.type ===
          "application/pdf" ||
        archivoSeleccionado.name
          .toLowerCase()
          .endsWith(".pdf");
  
      if (!esPdf) {
        setArchivo(null);
        setMensajeError(
          "Selecciona un archivo PDF válido.",
        );
        event.target.value = "";
        return;
      }
  
      const limiteBytes = 10 * 1024 * 1024;
  
      if (archivoSeleccionado.size > limiteBytes) {
        setArchivo(null);
        setMensajeError(
          "El archivo debe pesar como máximo 10 MB.",
        );
        event.target.value = "";
        return;
      }
  
      setArchivo(archivoSeleccionado);
      setMensajeError("");
    }
  
    function quitarArchivo() {
      setArchivo(null);
      setMensajeError("");
    }
  
    return (
      <section className="activities-panel">
        <div className="activities-header">
          <div>
            <p>Configuración automática</p>
            <h2>Importar sílabo</h2>
          </div>
        </div>
  
        <article className="next-activity">
          <p>Curso seleccionado</p>
  
          <h2>{nombreCurso}</h2>
  
          <span>
            UniRuta utilizará el sílabo para reconocer
            evaluaciones, porcentajes, semanas y temas.
          </span>
        </article>
  
        <div className="activity-form">
          <h3>Selecciona el archivo PDF</h3>
  
          <label className="form-field">
            <span>Sílabo del curso</span>
  
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={seleccionarArchivo}
            />
          </label>
  
          <small>
            Formato permitido: PDF. Tamaño máximo: 10 MB.
          </small>
  
          {mensajeError && (
            <p className="notes-mode-message">
              {mensajeError}
            </p>
          )}
        </div>
  
        {archivo && (
          <article className="activity-card">
            <div>
              <h3>{archivo.name}</h3>
  
              <p>Archivo listo para analizar</p>
  
              <div className="activity-meta">
                <span>
                  {formatearTamano(archivo.size)}
                </span>
  
                <span>PDF</span>
              </div>
            </div>
  
            <div className="activity-actions">
              <button
                type="button"
                className="delete-activity-button"
                onClick={quitarArchivo}
              >
                Quitar
              </button>
  
              <button type="button" disabled>
                Analizar sílabo
              </button>
            </div>
          </article>
        )}
  
        <p className="notes-mode-message">
          El botón de análisis se activará cuando
          conectemos el lector de PDF en el siguiente paso.
        </p>
      </section>
    );
  }
  
  export default ImportarSilaboCurso;