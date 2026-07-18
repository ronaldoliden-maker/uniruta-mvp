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

import type {
  EvaluacionPropuesta,
  PropuestaSilabo,
  TemaPropuesto,
} from "../types/propuestaSilabo";
import { analizarTextoSilabo } from "../utils/analizarTextoSilabo";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type ImportarSilaboCursoProps = {
  nombreCurso: string;
  onGuardarPropuesta: (
    propuesta: PropuestaSilabo,
  ) => boolean;
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
  onGuardarPropuesta,
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
  const [propuesta, setPropuesta] =
    useState<PropuestaSilabo | null>(null);
  const [mensajePeso, setMensajePeso] =
    useState("");
  const [mensajeGuardado, setMensajeGuardado] =
    useState("");

  function limpiarResultado() {
    setTextoExtraido("");
    setNumeroPaginas(0);
    setProgreso("");
    setPropuesta(null);
    setMensajePeso("");
    setMensajeGuardado("");
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

  function generarPropuesta() {
    if (!textoExtraido) {
      return;
    }

    const propuestaDetectada =
      analizarTextoSilabo(textoExtraido);

    setPropuesta({
      ...propuestaDetectada,
      nombreCurso:
        propuestaDetectada.nombreCurso || nombreCurso,
    });
    setMensajePeso("");
    setMensajeGuardado("");
  }

  function actualizarDatoCurso(
    campo:
      | "codigoCurso"
      | "nombreCurso"
      | "notaMinima"
      | "formula",
    valor: string,
  ) {
    setPropuesta((propuestaActual) =>
      propuestaActual
        ? {
            ...propuestaActual,
            [campo]: valor,
          }
        : propuestaActual,
    );
  }

  function actualizarEvaluacion(
    evaluacionId: string,
    campo: keyof Omit<EvaluacionPropuesta, "id">,
    valor: string,
  ) {
    if (!propuesta) {
      return;
    }

    if (campo === "peso") {
      if (valor === "") {
        setMensajePeso("");
      } else {
        const pesoNuevo = Number(valor);

        if (
          !Number.isFinite(pesoNuevo) ||
          pesoNuevo < 0 ||
          pesoNuevo > 100
        ) {
          setMensajePeso(
            "El peso debe estar entre 0 % y 100 %.",
          );
          return;
        }

        const pesoDeOtrasEvaluaciones =
          propuesta.evaluaciones.reduce(
            (total, evaluacion) =>
              evaluacion.id === evaluacionId
                ? total
                : total +
                  (Number(evaluacion.peso) || 0),
            0,
          );

        const pesoDisponible = Math.max(
          0,
          100 - pesoDeOtrasEvaluaciones,
        );

        if (pesoNuevo > pesoDisponible + 0.0001) {
          setMensajePeso(
            `Esa evaluación puede pesar como máximo ${pesoDisponible.toFixed(
              2,
            )} %. Reduce el peso de otra evaluación primero.`,
          );
          return;
        }

        setMensajePeso("");
      }
    }

    setPropuesta({
      ...propuesta,
      evaluaciones: propuesta.evaluaciones.map(
        (evaluacion) =>
          evaluacion.id === evaluacionId
            ? {
                ...evaluacion,
                [campo]: valor,
              }
            : evaluacion,
      ),
    });
  }

  function agregarEvaluacion() {
    const pesoActual =
      propuesta?.evaluaciones.reduce(
        (total, evaluacion) =>
          total + (Number(evaluacion.peso) || 0),
        0,
      ) ?? 0;

    const pesoDisponible = Math.max(
      0,
      100 - pesoActual,
    );

    if (!propuesta) {
      return;
    }

    if (pesoDisponible <= 0.0001) {
      setMensajePeso(
        "El peso total ya es 100 %. Reduce o elimina otra evaluación antes de agregar una nueva.",
      );
      return;
    }

    setPropuesta({
      ...propuesta,
      evaluaciones: [
        ...propuesta.evaluaciones,
        {
          id: `evaluacion-manual-${Date.now()}`,
          nombre: "Nueva evaluación",
          peso: "",
          semana: "",
        },
      ],
    });

    setMensajePeso(
      `Nueva evaluación agregada. Tienes ${pesoDisponible.toFixed(
        2,
      )} % disponible para asignar.`,
    );
  }

  function eliminarEvaluacion(
    evaluacionId: string,
  ) {
    setPropuesta((propuestaActual) =>
      propuestaActual
        ? {
            ...propuestaActual,
            evaluaciones:
              propuestaActual.evaluaciones.filter(
                (evaluacion) =>
                  evaluacion.id !== evaluacionId,
              ),
          }
        : propuestaActual,
    );

    setMensajePeso("");
  }

  function actualizarTema(
    temaId: string,
    campo: keyof Omit<TemaPropuesto, "id">,
    valor: string,
  ) {
    setPropuesta((propuestaActual) =>
      propuestaActual
        ? {
            ...propuestaActual,
            temas: propuestaActual.temas.map(
              (tema) =>
                tema.id === temaId
                  ? {
                      ...tema,
                      [campo]: valor,
                    }
                  : tema,
            ),
          }
        : propuestaActual,
    );
  }

  function agregarTema() {
    setPropuesta((propuestaActual) =>
      propuestaActual
        ? {
            ...propuestaActual,
            temas: [
              ...propuestaActual.temas,
              {
                id: `tema-manual-${Date.now()}`,
                titulo: "Nuevo tema",
                semana: "",
              },
            ],
          }
        : propuestaActual,
    );
  }

  function eliminarTema(temaId: string) {
    setPropuesta((propuestaActual) =>
      propuestaActual
        ? {
            ...propuestaActual,
            temas: propuestaActual.temas.filter(
              (tema) => tema.id !== temaId,
            ),
          }
        : propuestaActual,
    );
  }

  const pesoTotal =
    propuesta?.evaluaciones.reduce(
      (total, evaluacion) =>
        total + (Number(evaluacion.peso) || 0),
      0,
    ) ?? 0;

  const pesoDisponible = Math.max(
    0,
    100 - pesoTotal,
  );

  const pesoTotalValido =
    Math.abs(pesoTotal - 100) < 0.001;

  const notaMinimaNumerica = Number(
    propuesta?.notaMinima ?? "",
  );

  const datosCursoValidos =
    Boolean(propuesta?.nombreCurso.trim()) &&
    Number.isFinite(notaMinimaNumerica) &&
    notaMinimaNumerica >= 0 &&
    notaMinimaNumerica <= 20;

  const evaluacionesValidas =
    Boolean(propuesta?.evaluaciones.length) &&
    Boolean(
      propuesta?.evaluaciones.every(
        (evaluacion) =>
          evaluacion.nombre.trim() &&
          Number(evaluacion.peso) > 0,
      ),
    );

  const puedeGuardar =
    Boolean(propuesta) &&
    pesoTotalValido &&
    datosCursoValidos &&
    evaluacionesValidas;

  function guardarPropuesta() {
    if (!propuesta || !puedeGuardar) {
      return;
    }

    const guardada = onGuardarPropuesta(propuesta);

    if (guardada) {
      setMensajeGuardado(
        "La propuesta se guardó correctamente en el curso.",
      );
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
          UniRuta leerá el PDF y preparará una propuesta
          editable antes de modificar el curso.
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
              <span>{formatearTamano(archivo.size)}</span>
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
          <div className="activities-header">
            <div>
              <p>Texto reconocido</p>
              <h2>Contenido extraído</h2>
            </div>

            <button
              type="button"
              onClick={generarPropuesta}
            >
              Generar propuesta
            </button>
          </div>

          <label className="form-field">
            <span>
              Revisa que el contenido sea legible.
            </span>

            <textarea
              readOnly
              rows={12}
              value={textoExtraido}
              style={{
                width: "100%",
                minHeight: "240px",
                padding: "12px",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />
          </label>
        </section>
      )}

      {propuesta && (
        <section className="activities-panel">
          <div className="activities-header">
            <div>
              <p>Revisión previa</p>
              <h2>Propuesta detectada</h2>
            </div>
          </div>

          {propuesta.advertencias.length > 0 && (
            <article className="next-activity">
              <p>Revisión necesaria</p>
              <h2>
                Comprueba los datos antes de guardarlos
              </h2>

              {propuesta.advertencias.map(
                (advertencia) => (
                  <span key={advertencia}>
                    {advertencia}
                  </span>
                ),
              )}
            </article>
          )}

          <form className="activity-form">
            <h3>Datos del curso</h3>

            <div className="form-grid">
              <label className="form-field">
                <span>Código</span>
                <input
                  type="text"
                  value={propuesta.codigoCurso}
                  onChange={(event) =>
                    actualizarDatoCurso(
                      "codigoCurso",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="form-field">
                <span>Nombre</span>
                <input
                  type="text"
                  value={propuesta.nombreCurso}
                  onChange={(event) =>
                    actualizarDatoCurso(
                      "nombreCurso",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="form-field">
                <span>Nota mínima</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={propuesta.notaMinima}
                  onChange={(event) =>
                    actualizarDatoCurso(
                      "notaMinima",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="form-field">
                <span>Fórmula reconocida</span>
                <input
                  type="text"
                  value={propuesta.formula}
                  onChange={(event) =>
                    actualizarDatoCurso(
                      "formula",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </form>

          <section className="grade-components">
            <div className="activities-header">
              <div>
                <p>
                  Peso total: {pesoTotal.toFixed(2)} % ·
                  Disponible: {pesoDisponible.toFixed(2)} %
                </p>
                <h2>Evaluaciones detectadas</h2>
              </div>

              <button
                type="button"
                onClick={agregarEvaluacion}
                disabled={pesoDisponible <= 0.0001}
              >
                + Agregar evaluación
              </button>
            </div>

            <article className="next-activity">
              <p>Validación de porcentajes</p>
              <h2>
                {pesoTotalValido
                  ? "El sistema suma exactamente 100 %"
                  : `Falta distribuir ${pesoDisponible.toFixed(
                      2,
                    )} %`}
              </h2>
              <span>
                {pesoTotalValido
                  ? "Para agregar otra evaluación, primero reduce el peso de una existente."
                  : "La propuesta solo podrá guardarse cuando la suma sea exactamente 100 %."}
              </span>
            </article>

            {mensajePeso && (
              <p className="notes-mode-message">
                {mensajePeso}
              </p>
            )}

            {propuesta.evaluaciones.length === 0 ? (
              <article className="next-activity">
                <p>Evaluaciones</p>
                <h2>No se detectaron evaluaciones</h2>
                <span>
                  Puedes agregarlas manualmente antes de
                  guardar.
                </span>
              </article>
            ) : (
              <div className="activities-list">
                {propuesta.evaluaciones.map(
                  (evaluacion) => (
                    <article
                      className="activity-card"
                      key={evaluacion.id}
                    >
                      <div className="form-grid">
                        <label className="form-field">
                          <span>Evaluación</span>
                          <input
                            type="text"
                            value={evaluacion.nombre}
                            onChange={(event) =>
                              actualizarEvaluacion(
                                evaluacion.id,
                                "nombre",
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <label className="form-field">
                          <span>Peso (%)</span>
                          <input
                            type="number"
                            min="0"
                            max={
                              100 -
                              propuesta.evaluaciones.reduce(
                                (total, otraEvaluacion) =>
                                  otraEvaluacion.id ===
                                  evaluacion.id
                                    ? total
                                    : total +
                                      (Number(
                                        otraEvaluacion.peso,
                                      ) || 0),
                                0,
                              )
                            }
                            step="0.01"
                            value={evaluacion.peso}
                            onChange={(event) =>
                              actualizarEvaluacion(
                                evaluacion.id,
                                "peso",
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <label className="form-field">
                          <span>Semana</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={evaluacion.semana}
                            onChange={(event) =>
                              actualizarEvaluacion(
                                evaluacion.id,
                                "semana",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="activity-actions">
                        <button
                          type="button"
                          className="delete-activity-button"
                          onClick={() =>
                            eliminarEvaluacion(
                              evaluacion.id,
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="grade-components">
            <div className="activities-header">
              <div>
                <p>
                  {propuesta.temas.length} temas encontrados
                </p>
                <h2>Temario detectado</h2>
              </div>

              <button
                type="button"
                onClick={agregarTema}
              >
                + Agregar tema
              </button>
            </div>

            {propuesta.temas.length === 0 ? (
              <article className="next-activity">
                <p>Temario</p>
                <h2>No se detectaron temas</h2>
                <span>
                  Puedes agregarlos manualmente antes de
                  guardar.
                </span>
              </article>
            ) : (
              <div className="activities-list">
                {propuesta.temas.map((tema) => (
                  <article
                    className="activity-card"
                    key={tema.id}
                  >
                    <div className="form-grid">
                      <label className="form-field">
                        <span>Tema</span>
                        <input
                          type="text"
                          value={tema.titulo}
                          onChange={(event) =>
                            actualizarTema(
                              tema.id,
                              "titulo",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="form-field">
                        <span>Semana</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={tema.semana}
                          onChange={(event) =>
                            actualizarTema(
                              tema.id,
                              "semana",
                              event.target.value,
                            )
                          }
                          placeholder="Revisar"
                        />
                      </label>
                    </div>

                    <div className="activity-actions">
                      <button
                        type="button"
                        className="delete-activity-button"
                        onClick={() =>
                          eliminarTema(tema.id)
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

          <button
            type="button"
            onClick={guardarPropuesta}
            disabled={!puedeGuardar}
          >
            Guardar propuesta en el curso
          </button>

          {!puedeGuardar && (
            <p className="notes-mode-message">
              Para guardar, completa el nombre del curso,
              registra al menos una evaluación válida y
              verifica que los pesos sumen exactamente 100 %.
            </p>
          )}

          {mensajeGuardado && (
            <p className="notes-mode-message">
              {mensajeGuardado}
            </p>
          )}
        </section>
      )}
    </section>
  );
}

export default ImportarSilaboCurso;