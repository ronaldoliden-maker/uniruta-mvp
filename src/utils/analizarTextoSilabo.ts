import type {
    EvaluacionPropuesta,
    PropuestaSilabo,
    TemaPropuesto,
  } from "../types/propuestaSilabo";
  
  function crearId(prefijo: string, indice: number) {
    return `${prefijo}-${Date.now()}-${indice}`;
  }
  
  function limpiarTexto(texto: string) {
    return texto
      .replace(/--- Página \d+ ---/gi, "\n")
      .replace(/\[Sin texto reconocible\]/gi, "")
      .replace(/\r/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  
  function detectarCurso(texto: string) {
    const coincidencia = texto.match(
      /(?:ASIGNATURA\s*\n?|\b)([A-Z]{2,}\d{3,})\s*[–—-]\s*([^\n]+)/i,
    );
  
    if (!coincidencia) {
      return {
        codigoCurso: "",
        nombreCurso: "",
      };
    }
  
    return {
      codigoCurso: coincidencia[1].trim().toUpperCase(),
      nombreCurso: coincidencia[2].trim(),
    };
  }
  
  function detectarFormula(texto: string) {
    const coincidencia = texto.match(
      /Nota\s+final\s*=\s*([^\n]+)/i,
    );
  
    return coincidencia?.[1]?.trim() ?? "";
  }
  
  function detectarNotaMinima(texto: string) {
    const coincidencia = texto.match(
      /nota\s+m[ií]nima\s+para\s+aprobar(?:\s+el\s+curso)?\s+es\s+(\d+(?:[.,]\d+)?)/i,
    );
  
    return coincidencia?.[1]?.replace(",", ".") ?? "";
  }
  
  function obtenerSemanas(texto: string) {
    return Array.from(
      texto.matchAll(/Semana\s+(\d{1,2})/gi),
      (coincidencia) => coincidencia[1],
    );
  }
  
  function nombreEvaluacion(codigo: string) {
    const codigoNormalizado = codigo.toUpperCase();
  
    if (/^EC\d+$/.test(codigoNormalizado)) {
      return `Evaluación continua ${codigoNormalizado.replace("EC", "")}`;
    }
  
    if (codigoNormalizado === "EP") {
      return "Examen parcial";
    }
  
    if (codigoNormalizado === "EF") {
      return "Examen final";
    }
  
    if (codigoNormalizado === "PC") {
      return "Promedio de prácticas";
    }
  
    return codigoNormalizado;
  }
  
  function detectarEvaluaciones(texto: string) {
    const resultados: Array<{
      codigo: string;
      peso: string;
      posicion: number;
    }> = [];
  
    const patrones = [
      /\b(EC\d+)\s*\((\d+(?:[.,]\d+)?)\s*%\)/gi,
      /\b(EP|EF|PC)\s*\((\d+(?:[.,]\d+)?)\s*%\)/gi,
    ];
  
    patrones.forEach((patron) => {
      for (const coincidencia of texto.matchAll(patron)) {
        const codigo = coincidencia[1].toUpperCase();
  
        if (resultados.some((resultado) => resultado.codigo === codigo)) {
          continue;
        }
  
        resultados.push({
          codigo,
          peso: coincidencia[2].replace(",", "."),
          posicion: coincidencia.index ?? 0,
        });
      }
    });
  
    resultados.sort((a, b) => a.posicion - b.posicion);
  
    const semanas = obtenerSemanas(texto);
  
    return resultados.map<EvaluacionPropuesta>((resultado, indice) => ({
      id: crearId("evaluacion", indice),
      nombre: nombreEvaluacion(resultado.codigo),
      peso: resultado.peso,
      semana: semanas[indice] ?? "",
    }));
  }
  
  function detectarTemas(texto: string) {
    const coincidenciaSeccion = texto.match(
      /(?:^|\n)\s*5\.\s*TEMAS\s*\n([\s\S]*?)(?=\n\s*6\.\s*PLAN\s+DE\s+TRABAJO|\n\s*6\.\s)/i,
    );
  
    if (!coincidenciaSeccion) {
      return [];
    }
  
    const lineas = coincidenciaSeccion[1]
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean);
  
    const numerosPrincipales = Array.from(
      new Set(
        lineas.flatMap((linea) => {
          const coincidencias = Array.from(
            linea.matchAll(/(?:^|\s)5\.(\d+)(?!\.)/g),
          );
  
          return coincidencias.map(
            (coincidencia) => coincidencia[1],
          );
        }),
      ),
    ).sort((a, b) => Number(a) - Number(b));
  
    const temas: TemaPropuesto[] = [];
  
    numerosPrincipales.forEach((numero) => {
      const patronSubtema = new RegExp(
        `^5\\.${numero}\\.\\d+\\s+`,
      );
  
      const indicePrimerSubtema = lineas.findIndex(
        (linea) => patronSubtema.test(linea),
      );
  
      let titulo = "";
  
      if (indicePrimerSubtema >= 0) {
        for (
          let indice = indicePrimerSubtema - 1;
          indice >= 0;
          indice -= 1
        ) {
          const candidata = lineas[indice];
          const coincidenciaMismaLinea = candidata.match(
            new RegExp(`^5\\.${numero}(?!\\.)\\s+(.+)$`),
          );
  
          if (coincidenciaMismaLinea) {
            titulo = coincidenciaMismaLinea[1].trim();
            break;
          }
  
          if (
            /^5\.\d+(?!\.)\s*$/.test(candidata) ||
            /^5\.\d+\.\d+/.test(candidata) ||
            /^\d+$/.test(candidata)
          ) {
            continue;
          }
  
          titulo = candidata;
          break;
        }
      }
  
      if (!titulo) {
        const lineaPrincipal = lineas.find((linea) =>
          new RegExp(`^5\\.${numero}(?!\\.)\\s+`).test(linea),
        );
  
        titulo =
          lineaPrincipal
            ?.replace(
              new RegExp(`^5\\.${numero}(?!\\.)\\s+`),
              "",
            )
            .trim() ?? "";
      }
  
      if (!titulo) {
        return;
      }
  
      temas.push({
        id: crearId("tema", temas.length),
        titulo,
        semana: "",
      });
    });
  
    return temas;
  }
  
  export function analizarTextoSilabo(
    textoOriginal: string,
  ): PropuestaSilabo {
    const texto = limpiarTexto(textoOriginal);
    const curso = detectarCurso(texto);
    const formula = detectarFormula(texto);
    const notaMinima = detectarNotaMinima(texto);
    const evaluaciones = detectarEvaluaciones(texto);
    const temas = detectarTemas(texto);
    const advertencias: string[] = [];
  
    if (!curso.nombreCurso) {
      advertencias.push(
        "No se pudo reconocer automáticamente el nombre del curso.",
      );
    }
  
    if (evaluaciones.length === 0) {
      advertencias.push(
        "No se detectaron evaluaciones con porcentajes.",
      );
    }
  
    if (temas.length === 0) {
      advertencias.push(
        "No se detectó una lista clara de temas.",
      );
    }
  
    if (temas.length > 0 && temas.every((tema) => !tema.semana)) {
      advertencias.push(
        "El sílabo enumera temas, pero no los asigna claramente a semanas. Revísalos antes de guardar.",
      );
    }
  
    return {
      codigoCurso: curso.codigoCurso,
      nombreCurso: curso.nombreCurso,
      notaMinima,
      formula,
      evaluaciones,
      temas,
      advertencias,
    };
  }