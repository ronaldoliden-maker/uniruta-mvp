import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type ImportarSilaboCursoProps = {
  nombreCurso: string;
};

type ElementoTexto = {
  str: string;
  hasEOL?: boolean;
};

function formatearTamano(bytes: number) {
  const megabytes = bytes / 1024 / 1024;

  return `${megabytes.toFixed(2)} MB`;
}

function esElementoTexto(
  elemento: unknown,
): elemento is ElementoTexto {
  return (
    typeof elemento === "object" &&
    elemento !== null &&
    "str" in elemento &&
    typeof (elemento as ElementoTexto).str === "string"
  );
}

function limpiarTextoPagina(texto: string) {
  return texto
    .replace(/[\t ]+\n/g, "\n")
    .replace(/[\t ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ImportarSilaboCurso({
  nombreCurso,
}: ImportarSilaboCursoProps) {
  const inputArchivoRef =
    useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] =
    useState<File | null>(null);
  const [mensajeError, setMensajeError] =
    useState("");
  const [analizando, setAnalizando] =
    useState(false);
  const [progreso, setProgreso] =
    useState("");
  const [textoExtraido, setTextoExtraido] =
    useState("");
  const [numeroPaginas, setNumeroPaginas] =
    useState(0);

  function limpiarResultado() {
    setTextoExtraido("");
    setNumeroPaginas(0);
    setProgreso("");
  }

  function seleccionarArchivo(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const archivoSeleccionado =
      event.target.files?.[0];

    limpiarResultado();
    setMensajeError("");

    if (!archivoSeleccionado) {
      setArchivo(null);
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
  }

  function quitarArchivo() {
    setArchivo(null);
    setMensajeError("");
    limpiarResultado();

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  async function analizarSilabo() {
    if (!archivo || analizando) {
      return;
    }

    setAnalizando(true);
    setMensajeError("");
    limpiarResultado();

    try {
      const buffer = await archivo.arrayBuffer();
      const datosPdf = new Uint8Array(buffer);

      const tareaCarga = getDocument({
        data: datosPdf,
      });

      const documento = await tareaCarga.promise;
      setNumeroPaginas(documento.numPages);

      try {
        const textosPorPagina: string[] = [];

        for (
          let numeroPagina = 1;
          numeroPagina <= documento.numPages;
          numeroPagina += 1
        ) {
          setProgreso(
            `Leyendo página ${numeroPagina} de ${documento.numPages}...`,
          );

          const pagina = await documento.getPage(
            numeroPagina,
          );
          const contenido =
            await pagina.getTextContent();

          const textoPagina = limpiarTextoPagina(
            contenido.items
              .map((elemento) => {
                if (!esElementoTexto(elemento)) {
                  return "";
                }

                return `${elemento.str}${
                  elemento.hasEOL ? "\n" : " "
                }`;
              })
              .join(""),
          );

          textosPorPagina.push(
            `--- Página ${numeroPagina} ---\n${
              textoPagina || "[Sin texto reconocible]"
            }`,
          );

          pagina.cleanup();
        }

        const textoCompleto = textosPorPagina
          .join("\n\n")
          .trim();

        setTextoExtraido(textoCompleto);
        setMensajeError("");

        const textoSinEtiquetas = textoCompleto
          .replace(/--- Página \d+ ---/g, "")
          .replace(/\[Sin texto reconocible\]/g, "")
          .trim();

        if (textoSinEtiquetas.length < 20) {
          setMensajeError(
            "No se encontró texto suficiente. El PDF podría ser un escaneo o contener solo imágenes.",
          );
        }
      } finally {
        try {
          await documento.destroy();
        } catch (errorLimpieza) {
          console.warn(
            "El PDF se leyó correctamente, pero no se pudo cerrar completamente el lector:",
            errorLimpieza,
          );
        }
      }
    } catch (error) {
      console.error(
        "No se pudo leer el sílabo:",
        error,
      );

      setMensajeError(
        "No se pudo leer el PDF. Comprueba que el archivo no esté dañado ni protegido con contraseña.",
      );
    } finally {
      setAnalizando(false);
      setProgreso("");
    }
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
          Primero extraeremos el texto del PDF. Después
          UniRuta lo convertirá en evaluaciones, porcentajes,
          semanas y temas.
        </span>
      </article>

      <div className="activity-form">
        <h3>Selecciona el archivo PDF</h3>

        <label className="form-field">
          <span>Sílabo del curso</span>

          <input
            ref={inputArchivoRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={seleccionarArchivo}
            disabled={analizando}
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
            <p>
              {analizando
                ? progreso || "Preparando análisis..."
                : textoExtraido
                  ? "Texto extraído correctamente"
                  : "Archivo listo para analizar"}
            </p>

            <div className="activity-meta">
              <span>
                {formatearTamano(archivo.size)}
              </span>
              <span>PDF</span>

              {numeroPaginas > 0 && (
                <span>
                  {numeroPaginas}{" "}
                  {numeroPaginas === 1
                    ? "página"
                    : "páginas"}
                </span>
              )}
            </div>
          </div>

          <div className="activity-actions">
            <button
              type="button"
              className="delete-activity-button"
              onClick={quitarArchivo}
              disabled={analizando}
            >
              Quitar
            </button>

            <button
              type="button"
              onClick={analizarSilabo}
              disabled={analizando}
            >
              {analizando
                ? "Analizando..."
                : textoExtraido
                  ? "Analizar nuevamente"
                  : "Analizar sílabo"}
            </button>
          </div>
        </article>
      )}

      {textoExtraido && (
        <section className="grade-components">
          <h2>Texto extraído del sílabo</h2>

          <label className="form-field">
            <span>
              Revisa que el contenido sea legible antes de
              continuar.
            </span>

            <textarea
              readOnly
              rows={18}
              value={textoExtraido}
              style={{
                width: "100%",
                minHeight: "320px",
                padding: "12px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />
          </label>

          <small>
            Todavía no se guardará nada en el curso. En el
            siguiente paso convertiremos este texto en una
            propuesta que podrás revisar y confirmar.
          </small>
        </section>
      )}
    </section>
  );
}

export default ImportarSilaboCurso;