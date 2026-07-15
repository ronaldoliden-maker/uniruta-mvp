import { useState } from "react";

export type VistaApp =
  | "inicio"
  | "panel"
  | "curso";

export type PestanaApp =
  | "resumen"
  | "temario"
  | "actividades"
  | "notas"
  | "configuracion";

function useNavegacion() {
  const [vista, setVista] =
    useState<VistaApp>("inicio");

  const [pestanaCurso, setPestanaCurso] =
    useState<PestanaApp>("resumen");

  function irAlInicio() {
    setVista("inicio");
  }

  function irAlPanel() {
    setVista("panel");
  }

  function abrirVistaCurso() {
    setVista("curso");
    setPestanaCurso("resumen");
  }

  return {
    vista,
    pestanaCurso,
    setPestanaCurso,
    irAlInicio,
    irAlPanel,
    abrirVistaCurso,
  };
}

export default useNavegacion;