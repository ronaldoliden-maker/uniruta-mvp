import { useRef, useState } from "react";

type RespaldoUniRuta = {
  aplicacion: "UniRuta";
  version: 1;
  fechaExportacion: string;
  datos: Record<string, string>;
};

const PREFIJO_UNIRUTA = "uniruta-";

function obtenerDatosUniRuta() {
  const datos: Record<string, string> = {};

  for (
    let indice = 0;
    indice < localStorage.length;
    indice += 1
  ) {
    const clave = localStorage.key(indice);

    if (
      !clave ||
      !clave.startsWith(PREFIJO_UNIRUTA)
    ) {
      continue;
    }

    const valor = localStorage.getItem(clave);

    if (valor !== null) {
      datos[clave] = valor;
    }
  }

  return datos;
}

function descargarArchivo(
  contenido: string,
  nombreArchivo: string,
) {
  const blob = new Blob([contenido], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombreArchivo;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(url);
}

function esRespaldoValido(
  valor: unknown,
): valor is RespaldoUniRuta {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const respaldo = valor as Partial<RespaldoUniRuta>;

  return (
    respaldo.aplicacion === "UniRuta" &&
    respaldo.version === 1 &&
    typeof respaldo.fechaExportacion ===
      "string" &&
    typeof respaldo.datos === "object" &&
    respaldo.datos !== null &&
    !Array.isArray(respaldo.datos)
  );
}

function eliminarDatosActualesUniRuta() {
  const clavesAEliminar: string[] = [];

  for (
    let indice = 0;
    indice < localStorage.length;
    indice += 1
  ) {
    const clave = localStorage.key(indice);

    if (
      clave &&
      clave.startsWith(PREFIJO_UNIRUTA)
    ) {
      clavesAEliminar.push(clave);
    }
  }

  clavesAEliminar.forEach((clave) =>
    localStorage.removeItem(clave),
  );
}

function RespaldoDatos() {
  const inputArchivoRef =
    useRef<HTMLInputElement | null>(null);

  const [mensaje, setMensaje] =
    useState("");

  const [esError, setEsError] =
    useState(false);

  function exportarDatos() {
    const datos = obtenerDatosUniRuta();
    const cantidad = Object.keys(datos).length;

    if (cantidad === 0) {
      setEsError(true);
      setMensaje(
        "Todavía no hay datos de UniRuta para exportar.",
      );
      return;
    }

    const respaldo: RespaldoUniRuta = {
      aplicacion: "UniRuta",
      version: 1,
      fechaExportacion:
        new Date().toISOString(),
      datos,
    };

    const fecha = new Date()
      .toISOString()
      .slice(0, 10);

    descargarArchivo(
      JSON.stringify(respaldo, null, 2),
      `uniruta-respaldo-${fecha}.json`,
    );

    setEsError(false);
    setMensaje(
      `Copia creada correctamente con ${cantidad} registros.`,
    );
  }

  function abrirSelectorArchivo() {
    inputArchivoRef.current?.click();
  }

  async function importarDatos(
    archivo: File,
  ) {
    try {
      const texto = await archivo.text();
      const contenido = JSON.parse(
        texto,
      ) as unknown;

      if (!esRespaldoValido(contenido)) {
        throw new Error(
          "El archivo no es una copia válida de UniRuta.",
        );
      }

      const entradas = Object.entries(
        contenido.datos,
      ).filter(([clave, valor]) => {
        return (
          clave.startsWith(
            PREFIJO_UNIRUTA,
          ) &&
          typeof valor === "string"
        );
      });

      if (entradas.length === 0) {
        throw new Error(
          "La copia no contiene datos reconocibles de UniRuta.",
        );
      }

      const confirmar = window.confirm(
        `Se reemplazarán los datos actuales de esta laptop con ${entradas.length} registros del respaldo.\n\n¿Deseas continuar?`,
      );

      if (!confirmar) {
        return;
      }

      eliminarDatosActualesUniRuta();

      entradas.forEach(([clave, valor]) => {
        localStorage.setItem(clave, valor);
      });

      setEsError(false);
      setMensaje(
        "Datos restaurados correctamente. UniRuta se recargará ahora.",
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      const mensajeError =
        error instanceof Error
          ? error.message
          : "No se pudo importar la copia.";

      setEsError(true);
      setMensaje(mensajeError);
    } finally {
      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }
    }
  }

  return (
    <section className="activities-panel">
      <div className="activities-header">
        <div>
          <p>Protección de datos</p>
          <h2>Copia de seguridad</h2>
        </div>
      </div>

      <article className="next-activity">
        <p>Tus datos académicos</p>

        <h2>
          Lleva UniRuta a otra computadora
        </h2>

        <span>
          Exporta cursos, notas, actividades,
          temarios y planes en un archivo JSON.
          Después podrás restaurarlo en otro
          navegador o dispositivo.
        </span>
      </article>

      <div className="activity-actions">
        <button
          type="button"
          onClick={exportarDatos}
        >
          Exportar copia
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={abrirSelectorArchivo}
        >
          Importar copia
        </button>
      </div>

      <input
        ref={inputArchivoRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const archivo =
            event.target.files?.[0];

          if (archivo) {
            void importarDatos(archivo);
          }
        }}
      />

      {mensaje && (
        <p
          className="notes-mode-message"
          role={esError ? "alert" : "status"}
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}

export default RespaldoDatos;