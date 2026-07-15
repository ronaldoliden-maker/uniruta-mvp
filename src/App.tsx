import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

import Topbar from "./components/Topbar";
import Inicio from "./components/Inicio";
import ResumenGlobal from "./components/ResumenGlobal";
import TarjetaCurso from "./components/TarjetaCurso";
import EncabezadoCurso from "./components/EncabezadoCurso";
import ResumenCurso from "./components/ResumenCurso";

import NavegacionCurso, {
  type PestanaCurso,
} from "./components/NavegacionCurso";

import type { ComponenteNota, Curso } from "./types/academico";

import {
  cargarCursosRegistrados,
  guardarCursosRegistrados,
} from "./utils/almacenamientoListaCursos";

import type { Actividad } from "./types/actividad";

import {
  cargarActividadesCurso,
  guardarActividadesCurso,
} from "./utils/almacenamientoActividades";

import type { TemaCurso } from "./types/tema";

import {
  cargarTemarioCurso,
  guardarTemarioCurso,
} from "./utils/almacenamientoTemario";

import {
  calcularNotaFinal,
  obtenerEvaluacionesDirectas,
  obtenerPesosEvaluacionesDirectas,
  type NotasPorId,
} from "./utils/calcularNotas";

import {
  cargarMetaCurso,
  cargarNotasCurso,
  guardarMetaCurso,
  guardarNotasCurso,
} from "./utils/almacenamientoCursos";

type ModoNotas = "oficial" | "simulacion";

function tieneNota(valor: number | string | undefined) {
  return valor !== "" && valor !== undefined;
}

const cursosGuardadosIniciales = cargarCursosRegistrados();
const cursoInicial = cursosGuardadosIniciales[0] ?? null;

function App() {
  // ------------------------------------------------------------
  // 1. Navegación
  // ------------------------------------------------------------
  const [vista, setVista] = useState("inicio");
  const [pestanaCurso, setPestanaCurso] =
    useState<PestanaCurso>("resumen");

  // Lista editable de cursos del estudiante.
  // Debe declararse antes de utilizar cursosRegistrados.
  const [cursosRegistrados, setCursosRegistrados] = useState<Curso[]>(
    () => cursosGuardadosIniciales,
  );

  // ID del curso que el estudiante abrió desde el panel.
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string | null>(
    cursoInicial?.id ?? null,
  );

  // Formulario para agregar cursos.
  const [mostrarFormularioCurso, setMostrarFormularioCurso] = useState(false);
  const [cursoEditandoId, setCursoEditandoId] = useState<string | null>(null);

  const [nombreCursoNuevo, setNombreCursoNuevo] = useState("");

  const [codigoCursoNuevo, setCodigoCursoNuevo] = useState("");

  const [cicloCursoNuevo, setCicloCursoNuevo] = useState("2026-1");

  const [notaMinimaCursoNueva, setNotaMinimaCursoNueva] = useState("10.5");

  // Formulario del sistema de evaluación.
  const [mostrarFormularioComponente, setMostrarFormularioComponente] =
    useState(false);
  const [componenteEditandoId, setComponenteEditandoId] = useState<
    string | null
  >(null);
  const [nombreComponente, setNombreComponente] = useState("");
  const [pesoComponente, setPesoComponente] = useState("");
  const [notaMaximaComponente, setNotaMaximaComponente] = useState("20");

  // Se calcula después de declarar cursosRegistrados.
  const cursoSeleccionado =
    cursosRegistrados.find((curso) => curso.id === cursoSeleccionadoId) ??
    cursosRegistrados[0] ??
    null;

  // ------------------------------------------------------------
  // 2. Actividades
  // ------------------------------------------------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreActividad, setNombreActividad] = useState("");
  const [tipoActividad, setTipoActividad] = useState("Tarea");
  const [semanaActividad, setSemanaActividad] = useState("");
  const [fechaActividad, setFechaActividad] = useState("");
  const [actividadEditandoId, setActividadEditandoId] = useState<number | null>(
    null,
  );

  const [actividades, setActividades] = useState<Actividad[]>(() =>
    cursoInicial ? cargarActividadesCurso(cursoInicial.id) : [],
  );

  // ------------------------------------------------------------
  // 3. Temario semanal
  // ------------------------------------------------------------
  const [temario, setTemario] = useState<TemaCurso[]>(() =>
    cursoInicial ? cargarTemarioCurso(cursoInicial.id) : [],
  );

  const [mostrarFormularioTema, setMostrarFormularioTema] = useState(false);
  const [temaEditandoId, setTemaEditandoId] = useState<number | null>(null);
  const [semanaTema, setSemanaTema] = useState("");
  const [tituloTema, setTituloTema] = useState("");
  const [detalleTema, setDetalleTema] = useState("");

  // ------------------------------------------------------------
  // 4. Notas oficiales y simulación
  // ------------------------------------------------------------
  const [notasOficiales, setNotasOficiales] = useState<NotasPorId>(() =>
    cursoInicial ? cargarNotasCurso(cursoInicial) : {},
  );

  const [modoNotas, setModoNotas] = useState<ModoNotas>("oficial");

  // Las notas simuladas viven solo en memoria: no se guardan en localStorage.
  const [notasSimuladas, setNotasSimuladas] = useState<NotasPorId>({});

  const [metaNota, setMetaNota] = useState(() =>
    cursoInicial ? cargarMetaCurso(cursoInicial) : "10.5",
  );

  // ------------------------------------------------------------
  // 5. Persistencia
  // ------------------------------------------------------------
  // Guarda las actividades utilizando el ID
  // del curso actualmente seleccionado.
  useEffect(() => {
    if (!cursoSeleccionadoId) {
      return;
    }

    guardarActividadesCurso(cursoSeleccionadoId, actividades);
  }, [actividades, cursoSeleccionadoId]);

  useEffect(() => {
    if (!cursoSeleccionadoId) {
      return;
    }

    guardarTemarioCurso(cursoSeleccionadoId, temario);
  }, [temario, cursoSeleccionadoId]);

  useEffect(() => {
    if (!cursoSeleccionadoId) {
      return;
    }

    guardarNotasCurso(cursoSeleccionadoId, notasOficiales);
  }, [notasOficiales, cursoSeleccionadoId]);

  useEffect(() => {
    if (!cursoSeleccionadoId) {
      return;
    }

    guardarMetaCurso(cursoSeleccionadoId, metaNota);
  }, [metaNota, cursoSeleccionadoId]);

  useEffect(() => {
    guardarCursosRegistrados(cursosRegistrados);
  }, [cursosRegistrados]);

  // ------------------------------------------------------------
  // 5. Cálculos de actividades
  // ------------------------------------------------------------
  const pendientes = actividades.filter(
    (actividad) => actividad.estado !== "Completada",
  ).length;

  // Suma las actividades de todos los cursos para el panel principal.
  const resumenActividadesGlobal = cursosRegistrados.reduce(
    (totales, curso) => {
      const actividadesDelCurso =
        curso.id === cursoSeleccionadoId
          ? actividades
          : cargarActividadesCurso(curso.id);

      const pendientesDelCurso = actividadesDelCurso.filter(
        (actividad) => actividad.estado !== "Completada",
      ).length;

      const completadasDelCurso = actividadesDelCurso.filter(
        (actividad) => actividad.estado === "Completada",
      ).length;

      return {
        pendientes: totales.pendientes + pendientesDelCurso,

        completadas: totales.completadas + completadasDelCurso,
      };
    },
    {
      pendientes: 0,
      completadas: 0,
    },
  );

  function obtenerNumeroSemana(textoSemana: string) {
    const coincidencia = textoSemana.match(/\d+/);

    return coincidencia ? Number(coincidencia[0]) : 999;
  }

  const actividadesOrdenadas = [...actividades].sort(
    (actividadA, actividadB) =>
      obtenerNumeroSemana(actividadA.semana) -
      obtenerNumeroSemana(actividadB.semana),
  );

  const proximaActividad = actividadesOrdenadas.find(
    (actividad) => actividad.estado !== "Completada",
  );

  const temasOrdenados = [...temario].sort(
    (temaA, temaB) =>
      temaA.semana - temaB.semana || temaA.titulo.localeCompare(temaB.titulo),
  );

  const temasCompletados = temario.filter(
    (tema) => tema.estado === "Completado",
  ).length;

  const pesoTotalComponentes =
    cursoSeleccionado?.componentes.reduce(
      (total, componente) => total + (componente.peso ?? 0),
      0,
    ) ?? 0;

  // Evaluaciones pertenecientes al curso abierto.
  const evaluacionesDinamicas = cursoSeleccionado
    ? obtenerEvaluacionesDirectas(cursoSeleccionado.componentes)
    : [];

  // Peso real de cada evaluación dentro de ese curso.
  const pesosEvaluaciones = cursoSeleccionado
    ? obtenerPesosEvaluacionesDirectas(cursoSeleccionado.componentes)
    : {};

  // ------------------------------------------------------------
  // 6. Funciones de actividades
  // ------------------------------------------------------------
  function alternarEstadoActividad(id: number) {
    setActividades((actividadesActuales) =>
      actividadesActuales.map((actividad) =>
        actividad.id === id
          ? {
              ...actividad,
              estado:
                actividad.estado === "Completada"
                  ? "No iniciada"
                  : "Completada",
            }
          : actividad,
      ),
    );
  }

  function eliminarActividad(id: number) {
    const actividadSeleccionada = actividades.find(
      (actividad) => actividad.id === id,
    );

    if (!actividadSeleccionada) {
      return;
    }

    const confirmarEliminacion = window.confirm(
      `¿Seguro que deseas eliminar "${actividadSeleccionada.nombre}"?`,
    );

    if (!confirmarEliminacion) {
      return;
    }

    setActividades((actividadesActuales) =>
      actividadesActuales.filter((actividad) => actividad.id !== id),
    );
  }

  function formatearFecha(fecha: string) {
    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  }

  function convertirFechaParaInput(fechaGuardada: string) {
    const coincidencia = fechaGuardada.match(/(\d{2})\/(\d{2})\/(\d{4})/);

    if (!coincidencia) {
      return "";
    }

    const [, dia, mes, anio] = coincidencia;

    return `${anio}-${mes}-${dia}`;
  }

  function limpiarFormulario() {
    setNombreActividad("");
    setTipoActividad("Tarea");
    setSemanaActividad("");
    setFechaActividad("");
    setActividadEditandoId(null);
    setMostrarFormulario(false);
  }

  function abrirFormularioNuevo() {
    limpiarFormulario();
    setMostrarFormulario(true);
  }

  function abrirFormularioEdicion(id: number) {
    const actividadSeleccionada = actividades.find(
      (actividad) => actividad.id === id,
    );

    if (!actividadSeleccionada) {
      return;
    }

    setNombreActividad(actividadSeleccionada.nombre);
    setTipoActividad(actividadSeleccionada.tipo);
    setSemanaActividad(
      String(obtenerNumeroSemana(actividadSeleccionada.semana)),
    );
    setFechaActividad(convertirFechaParaInput(actividadSeleccionada.fecha));
    setActividadEditandoId(id);
    setMostrarFormulario(true);
  }

  function agregarActividad(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nombreActividad.trim() || !semanaActividad) {
      return;
    }

    const datosActividad = {
      nombre: nombreActividad.trim(),
      tipo: tipoActividad,
      semana: `Semana ${semanaActividad}`,
      fecha: fechaActividad
        ? `Fecha: ${formatearFecha(fechaActividad)}`
        : "Fecha exacta pendiente",
    };

    if (actividadEditandoId !== null) {
      setActividades((actividadesActuales) =>
        actividadesActuales.map((actividad) =>
          actividad.id === actividadEditandoId
            ? {
                ...actividad,
                ...datosActividad,
              }
            : actividad,
        ),
      );
    } else {
      const nuevaActividad: Actividad = {
        id: Date.now(),
        ...datosActividad,
        estado: "No iniciada",
      };

      setActividades((actividadesActuales) => [
        ...actividadesActuales,
        nuevaActividad,
      ]);
    }

    limpiarFormulario();
  }

  // ------------------------------------------------------------
  // 7. Funciones del temario
  // ------------------------------------------------------------
  function limpiarFormularioTema() {
    setSemanaTema("");
    setTituloTema("");
    setDetalleTema("");
    setTemaEditandoId(null);
    setMostrarFormularioTema(false);
  }

  function abrirFormularioNuevoTema() {
    limpiarFormularioTema();
    setMostrarFormularioTema(true);
  }

  function abrirFormularioEdicionTema(id: number) {
    const temaSeleccionado = temario.find((tema) => tema.id === id);

    if (!temaSeleccionado) {
      return;
    }

    setSemanaTema(String(temaSeleccionado.semana));
    setTituloTema(temaSeleccionado.titulo);
    setDetalleTema(temaSeleccionado.detalle);
    setTemaEditandoId(temaSeleccionado.id);
    setMostrarFormularioTema(true);
  }

  function guardarTema(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const semana = Number(semanaTema);
    const titulo = tituloTema.trim();
    const detalle = detalleTema.trim();

    if (!Number.isInteger(semana) || semana < 1 || semana > 20 || !titulo) {
      return;
    }

    if (temaEditandoId !== null) {
      setTemario((temasActuales) =>
        temasActuales.map((tema) =>
          tema.id === temaEditandoId
            ? {
                ...tema,
                semana,
                titulo,
                detalle,
              }
            : tema,
        ),
      );
    } else {
      const nuevoTema: TemaCurso = {
        id: Date.now(),
        semana,
        titulo,
        detalle,
        estado: "Pendiente",
      };

      setTemario((temasActuales) => [...temasActuales, nuevoTema]);
    }

    limpiarFormularioTema();
  }

  function alternarEstadoTema(id: number) {
    setTemario((temasActuales) =>
      temasActuales.map((tema) => {
        if (tema.id !== id) {
          return tema;
        }

        const siguienteEstado =
          tema.estado === "Pendiente"
            ? "En progreso"
            : tema.estado === "En progreso"
              ? "Completado"
              : "Pendiente";

        return {
          ...tema,
          estado: siguienteEstado,
        };
      }),
    );
  }

  function eliminarTema(id: number) {
    const temaSeleccionado = temario.find((tema) => tema.id === id);

    if (!temaSeleccionado) {
      return;
    }

    const confirmarEliminacion = window.confirm(
      `¿Seguro que deseas eliminar el tema "${temaSeleccionado.titulo}"?`,
    );

    if (!confirmarEliminacion) {
      return;
    }

    setTemario((temasActuales) =>
      temasActuales.filter((tema) => tema.id !== id),
    );

    if (temaEditandoId === id) {
      limpiarFormularioTema();
    }
  }

  // ------------------------------------------------------------
  // 8. Funciones de notas
  // ------------------------------------------------------------
  function actualizarMeta(valor: string) {
    if (valor === "") {
      setMetaNota("");
      return;
    }

    const numero = Number(valor);

    if (Number.isFinite(numero) && numero >= 0 && numero <= 20) {
      setMetaNota(valor);
    }
  }

  function actualizarNota(id: string, valor: string, notaMaxima: number) {
    const valorOficial = notasOficiales[id];
    const campoTieneNotaOficial = tieneNota(valorOficial);

    // En simulación, las notas oficiales quedan bloqueadas.
    if (modoNotas === "simulacion" && campoTieneNotaOficial) {
      return;
    }

    if (valor !== "") {
      const numero = Number(valor);

      if (!Number.isFinite(numero) || numero < 0 || numero > notaMaxima) {
        return;
      }
    }

    if (modoNotas === "simulacion") {
      setNotasSimuladas((notasActuales) => ({
        ...notasActuales,
        [id]: valor,
      }));

      return;
    }

    setNotasOficiales((notasActuales) => ({
      ...notasActuales,
      [id]: valor,
    }));
  }

  function activarModoOficial() {
    setModoNotas("oficial");
  }

  function activarModoSimulacion() {
    // Cada simulación empieza como una copia de las notas oficiales.
    setNotasSimuladas({
      ...notasOficiales,
    });
    setModoNotas("simulacion");
  }

  function restablecerSimulacion() {
    setNotasSimuladas({
      ...notasOficiales,
    });
  }

  // ------------------------------------------------------------
  // 9. Cálculos académicos
  // ------------------------------------------------------------
  const notasEnFormulario =
    modoNotas === "simulacion" ? notasSimuladas : notasOficiales;

  const notaFinalOficial = cursoSeleccionado
    ? calcularNotaFinal(
        cursoSeleccionado.componentes,
        notasOficiales,
        cursoSeleccionado.notaMaxima,
      )
    : 0;

  const notaFinalMostrada = cursoSeleccionado
    ? calcularNotaFinal(
        cursoSeleccionado.componentes,
        notasEnFormulario,
        cursoSeleccionado.notaMaxima,
      )
    : 0;

  const notaMinimaCurso = cursoSeleccionado?.notaMinima ?? 10.5;

  const notaFinalRedondeada = Math.round(notaFinalMostrada);
  const diferenciaSimulada = notaFinalMostrada - notaFinalOficial;

  const porcentajeEvaluado = evaluacionesDinamicas.reduce(
    (total, evaluacion) => {
      if (!tieneNota(notasOficiales[evaluacion.id])) {
        return total;
      }

      return total + (pesosEvaluaciones[evaluacion.id] ?? 0);
    },
    0,
  );

  const puntosAcumulados = evaluacionesDinamicas.reduce((total, evaluacion) => {
    const valor = notasOficiales[evaluacion.id];

    if (!tieneNota(valor)) {
      return total;
    }

    const nota = Number(valor);
    const peso = pesosEvaluaciones[evaluacion.id] ?? 0;

    const aporte = (nota / evaluacion.notaMaxima) * 20 * (peso / 100);

    return total + aporte;
  }, 0);

  const porcentajePendiente = Math.max(0, 100 - porcentajeEvaluado);

  const promedioActual =
    porcentajeEvaluado > 0
      ? puntosAcumulados / (porcentajeEvaluado / 100)
      : null;

  const metaNumerica = Number(metaNota || 0);

  const promedioNecesario =
    porcentajePendiente > 0
      ? (metaNumerica - puntosAcumulados) / (porcentajePendiente / 100)
      : null;

  const estadoMostrado =
    modoNotas === "simulacion"
      ? notaFinalMostrada >= notaMinimaCurso
        ? "Aprobado en simulación"
        : `No alcanza ${notaMinimaCurso}`
      : porcentajeEvaluado === 0
        ? "Sin notas"
        : porcentajeEvaluado < 100
          ? "En progreso"
          : notaFinalOficial >= notaMinimaCurso
            ? "Aprobado"
            : "Desaprobado";

  // Información que se mostrará en las tarjetas del panel.
  const cursosPanel = cursosRegistrados.map((curso) => {
    const actividadesDelCurso =
      curso.id === cursoSeleccionadoId
        ? actividades
        : cargarActividadesCurso(curso.id);

    const actividadesOrdenadasCurso = [...actividadesDelCurso].sort(
      (actividadA, actividadB) =>
        obtenerNumeroSemana(actividadA.semana) -
        obtenerNumeroSemana(actividadB.semana),
    );

    const pendientesCurso = actividadesDelCurso.filter(
      (actividad) => actividad.estado !== "Completada",
    ).length;

    const proximaActividadCurso = actividadesOrdenadasCurso.find(
      (actividad) => actividad.estado !== "Completada",
    );

    const notasDelCurso =
      curso.id === cursoSeleccionadoId
        ? notasOficiales
        : cargarNotasCurso(curso);

    const evaluacionesCurso = obtenerEvaluacionesDirectas(curso.componentes);

    const pesosCurso = obtenerPesosEvaluacionesDirectas(curso.componentes);

    const porcentajeEvaluadoCurso = evaluacionesCurso.reduce(
      (total, evaluacion) => {
        if (!tieneNota(notasDelCurso[evaluacion.id])) {
          return total;
        }

        return total + (pesosCurso[evaluacion.id] ?? 0);
      },
      0,
    );

    const puntosAcumuladosCurso = evaluacionesCurso.reduce(
      (total, evaluacion) => {
        const valor = notasDelCurso[evaluacion.id];

        if (!tieneNota(valor)) {
          return total;
        }

        const nota = Number(valor);
        const peso = pesosCurso[evaluacion.id] ?? 0;

        return total + (nota / evaluacion.notaMaxima) * 20 * (peso / 100);
      },
      0,
    );

    const promedioCurso =
      porcentajeEvaluadoCurso > 0
        ? puntosAcumuladosCurso / (porcentajeEvaluadoCurso / 100)
        : null;

    return {
      id: curso.id,
      nombre: curso.nombre,
      codigo: curso.codigo ?? "Sin código",
      ciclo: curso.ciclo,

      promedio: promedioCurso === null ? "Sin notas" : promedioCurso.toFixed(2),

      pendientes: pendientesCurso,

      proximaActividad: proximaActividadCurso
        ? proximaActividadCurso.nombre
        : "Sin actividades pendientes",
    };
  });

  function abrirCurso(cursoId: string) {
    const curso = cursosRegistrados.find(
      (cursoRegistrado) => cursoRegistrado.id === cursoId,
    );

    if (!curso) {
      return;
    }

    setCursoSeleccionadoId(curso.id);

    setNotasOficiales(cargarNotasCurso(curso));

    setMetaNota(cargarMetaCurso(curso));

    setActividades(cargarActividadesCurso(curso.id));
    setTemario(cargarTemarioCurso(curso.id));

    // Limpia cualquier simulación o formulario anterior.
    setNotasSimuladas({});
    setModoNotas("oficial");
    setMostrarFormulario(false);
    setActividadEditandoId(null);
    limpiarFormularioTema();
    limpiarFormularioComponente();

    setVista("curso");
    setPestanaCurso("resumen");
  }

  function limpiarFormularioCurso() {
    setNombreCursoNuevo("");
    setCodigoCursoNuevo("");
    setCicloCursoNuevo("2026-1");
    setNotaMinimaCursoNueva("10.5");
    setCursoEditandoId(null);
    setMostrarFormularioCurso(false);
  }

  function abrirFormularioNuevoCurso() {
    setNombreCursoNuevo("");
    setCodigoCursoNuevo("");
    setCicloCursoNuevo("2026-1");
    setNotaMinimaCursoNueva("10.5");
    setCursoEditandoId(null);
    setMostrarFormularioCurso(true);
  }

  function abrirFormularioEdicionCurso(cursoId: string) {
    const curso = cursosRegistrados.find(
      (cursoRegistrado) => cursoRegistrado.id === cursoId,
    );

    if (!curso) {
      return;
    }

    setCursoEditandoId(curso.id);
    setNombreCursoNuevo(curso.nombre);
    setCodigoCursoNuevo(curso.codigo ?? "");
    setCicloCursoNuevo(curso.ciclo);
    setNotaMinimaCursoNueva(String(curso.notaMinima));
    setMostrarFormularioCurso(true);
  }

  function agregarCurso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombre = nombreCursoNuevo.trim();
    const codigo = codigoCursoNuevo.trim().toUpperCase();
    const ciclo = cicloCursoNuevo.trim();
    const notaMinima = Number(notaMinimaCursoNueva);

    if (!nombre || !ciclo) {
      return;
    }

    if (!Number.isFinite(notaMinima) || notaMinima < 0 || notaMinima > 20) {
      return;
    }

    if (cursoEditandoId) {
      setCursosRegistrados((cursosActuales) =>
        cursosActuales.map((curso) =>
          curso.id === cursoEditandoId
            ? {
                ...curso,
                nombre,
                codigo: codigo || undefined,
                ciclo,
                notaMinima,
              }
            : curso,
        ),
      );

      limpiarFormularioCurso();
      return;
    }

    const nuevoCurso: Curso = {
      id: `curso-${Date.now()}`,
      nombre,
      codigo: codigo || undefined,
      ciclo,
      notaMinima,
      notaMaxima: 20,
      componentes: [],
      estado: "en_curso",
    };

    setCursosRegistrados((cursosActuales) => [...cursosActuales, nuevoCurso]);

    limpiarFormularioCurso();
  }

  function eliminarCurso(cursoId: string) {
    const curso = cursosRegistrados.find(
      (cursoRegistrado) => cursoRegistrado.id === cursoId,
    );

    if (!curso) {
      return;
    }

    if (cursosRegistrados.length === 1) {
      window.alert("UniRuta necesita conservar al menos un curso.");
      return;
    }

    const confirmarEliminacion = window.confirm(
      `¿Seguro que deseas eliminar el curso "${curso.nombre}"?`,
    );

    if (!confirmarEliminacion) {
      return;
    }

    const cursosRestantes = cursosRegistrados.filter(
      (cursoRegistrado) => cursoRegistrado.id !== cursoId,
    );

    setCursosRegistrados(cursosRestantes);

    localStorage.removeItem(`uniruta-curso-${cursoId}-notas`);
    localStorage.removeItem(`uniruta-curso-${cursoId}-meta`);
    localStorage.removeItem(`uniruta-curso-${cursoId}-actividades`);
    localStorage.removeItem(`uniruta-curso-${cursoId}-temario`);

    if (cursoEditandoId === cursoId) {
      limpiarFormularioCurso();
    }

    if (cursoSeleccionadoId === cursoId) {
      const siguienteCurso = cursosRestantes[0];

      setCursoSeleccionadoId(siguienteCurso.id);
      setNotasOficiales(cargarNotasCurso(siguienteCurso));
      setMetaNota(cargarMetaCurso(siguienteCurso));
      setActividades(cargarActividadesCurso(siguienteCurso.id));
      setTemario(cargarTemarioCurso(siguienteCurso.id));
      setNotasSimuladas({});
      setModoNotas("oficial");
      setMostrarFormulario(false);
      setActividadEditandoId(null);
      limpiarFormularioTema();
      limpiarFormularioComponente();
    }
  }

  function limpiarFormularioComponente() {
    setNombreComponente("");
    setPesoComponente("");
    setNotaMaximaComponente("20");
    setComponenteEditandoId(null);
    setMostrarFormularioComponente(false);
  }

  function abrirFormularioNuevoComponente() {
    limpiarFormularioComponente();
    setMostrarFormularioComponente(true);
  }

  function abrirFormularioEdicionComponente(componenteId: string) {
    const componente = cursoSeleccionado?.componentes.find(
      (componenteRegistrado) => componenteRegistrado.id === componenteId,
    );

    if (!componente) {
      return;
    }

    setComponenteEditandoId(componente.id);
    setNombreComponente(componente.nombre);
    setPesoComponente(String(componente.peso ?? 0));
    setNotaMaximaComponente(String(componente.notaMaxima ?? 20));
    setMostrarFormularioComponente(true);
  }

  function guardarComponente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cursoSeleccionado) {
      return;
    }

    const nombre = nombreComponente.trim();
    const peso = Number(pesoComponente);
    const notaMaxima = Number(notaMaximaComponente);

    if (!nombre) {
      return;
    }

    if (!Number.isFinite(peso) || peso <= 0 || peso > 100) {
      window.alert("El peso debe ser mayor que 0 y como máximo 100.");
      return;
    }

    if (
      !Number.isFinite(notaMaxima) ||
      notaMaxima <= 0 ||
      notaMaxima > 100
    ) {
      window.alert("La nota máxima debe ser mayor que 0 y como máximo 100.");
      return;
    }

    const pesoDeOtrosComponentes = cursoSeleccionado.componentes.reduce(
      (total, componente) =>
        componente.id === componenteEditandoId
          ? total
          : total + (componente.peso ?? 0),
      0,
    );

    if (pesoDeOtrosComponentes + peso > 100.0001) {
      window.alert(
        `El peso total no puede superar 100 %. Actualmente quedan ${Math.max(
          0,
          100 - pesoDeOtrosComponentes,
        ).toFixed(2)} % disponibles.`,
      );
      return;
    }

    let componentesActualizados: ComponenteNota[];

    if (componenteEditandoId) {
      componentesActualizados = cursoSeleccionado.componentes.map(
        (componente) =>
          componente.id === componenteEditandoId
            ? {
                ...componente,
                nombre,
                peso,
                ...(componente.tipo === "nota_directa"
                  ? { notaMaxima }
                  : {}),
              }
            : componente,
      );
    } else {
      const nuevoComponente: ComponenteNota = {
        id: `evaluacion-${Date.now()}`,
        nombre,
        tipo: "nota_directa",
        peso,
        notaMaxima,
        redondeo: "ninguno",
      };

      componentesActualizados = [
        ...cursoSeleccionado.componentes,
        nuevoComponente,
      ];
    }

    setCursosRegistrados((cursosActuales) =>
      cursosActuales.map((curso) =>
        curso.id === cursoSeleccionado.id
          ? {
              ...curso,
              componentes: componentesActualizados,
            }
          : curso,
      ),
    );

    setNotasSimuladas({});
    setModoNotas("oficial");
    limpiarFormularioComponente();
  }

  function eliminarComponente(componenteId: string) {
    if (!cursoSeleccionado) {
      return;
    }

    const componente = cursoSeleccionado.componentes.find(
      (componenteRegistrado) => componenteRegistrado.id === componenteId,
    );

    if (!componente) {
      return;
    }

    const confirmarEliminacion = window.confirm(
      `¿Seguro que deseas eliminar "${componente.nombre}" del sistema de evaluación?`,
    );

    if (!confirmarEliminacion) {
      return;
    }

    setCursosRegistrados((cursosActuales) =>
      cursosActuales.map((curso) =>
        curso.id === cursoSeleccionado.id
          ? {
              ...curso,
              componentes: curso.componentes.filter(
                (componenteRegistrado) =>
                  componenteRegistrado.id !== componenteId,
              ),
            }
          : curso,
      ),
    );

    if (componenteEditandoId === componenteId) {
      limpiarFormularioComponente();
    }

    setNotasSimuladas({});
    setModoNotas("oficial");
  }

  return (
    <main className="app">
      <Topbar
        ciclo={
          cursoSeleccionado?.ciclo ??
          cursosRegistrados[0]?.ciclo ??
          "Sin ciclo"
        }
      />

      {vista === "inicio" && (
        <Inicio
          onComenzar={() => setVista("panel")}
        />
      )}

      {vista === "panel" && (
        <section className="welcome">
          <p>Semana actual</p>
          <h1>Semana 1 de 16</h1>
          <p>
            Aquí aparecerá el resumen de tus actividades, cursos y evaluaciones.
          </p>

          <ResumenGlobal
            pendientes={resumenActividadesGlobal.pendientes}
            atrasadas={0}
            completadas={resumenActividadesGlobal.completadas}
          />

          <section className="courses-section">
            <div className="courses-section-heading">
              <h2>Mis cursos</h2>

              <button
                type="button"
                onClick={abrirFormularioNuevoCurso}
              >
                + Agregar curso
              </button>
            </div>

            {mostrarFormularioCurso && (
              <form className="activity-form" onSubmit={agregarCurso}>
                <h3>{cursoEditandoId ? "Editar curso" : "Nuevo curso"}</h3>

                <div className="form-grid">
                  <label className="form-field">
                    <span>Nombre del curso</span>

                    <input
                      type="text"
                      value={nombreCursoNuevo}
                      onChange={(event) =>
                        setNombreCursoNuevo(event.target.value)
                      }
                      placeholder="Ejemplo: Termodinámica"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Código</span>

                    <input
                      type="text"
                      value={codigoCursoNuevo}
                      onChange={(event) =>
                        setCodigoCursoNuevo(event.target.value)
                      }
                      placeholder="Ejemplo: TERMO"
                      maxLength={12}
                    />
                  </label>

                  <label className="form-field">
                    <span>Ciclo</span>

                    <input
                      type="text"
                      value={cicloCursoNuevo}
                      onChange={(event) =>
                        setCicloCursoNuevo(event.target.value)
                      }
                      placeholder="2026-1"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Nota mínima</span>

                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={notaMinimaCursoNueva}
                      onChange={(event) =>
                        setNotaMinimaCursoNueva(event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={limpiarFormularioCurso}
                  >
                    Cancelar
                  </button>

                  <button type="submit">
                    {cursoEditandoId ? "Guardar cambios" : "Guardar curso"}
                  </button>
                </div>
              </form>
            )}

            <div className="course-list">
              {cursosPanel.map((curso) => (
                <TarjetaCurso
                  key={curso.id}
                  curso={curso}
                  onAbrir={abrirCurso}
                  onEditar={abrirFormularioEdicionCurso}
                  onEliminar={eliminarCurso}
                />
              ))}
            </div>
          </section>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setVista("inicio")}
          >
            Volver
          </button>
        </section>
      )}

      {vista === "curso" && cursoSeleccionado && (
        <section className="course-detail">
          <button
            type="button"
            className="back-button"
            onClick={() => setVista("panel")}
          >
            ← Volver al panel
          </button>

          <EncabezadoCurso curso={cursoSeleccionado} />

          <NavegacionCurso
            pestanaActiva={pestanaCurso}
            onCambiar={setPestanaCurso}
          />

          {pestanaCurso === "resumen" && (
            <ResumenCurso
              curso={cursoSeleccionado}
              promedioActual={promedioActual}
              porcentajeEvaluado={porcentajeEvaluado}
              pendientes={pendientes}
              temasCompletados={temasCompletados}
              totalTemas={temario.length}
              proximaActividad={proximaActividad}
            />
          )}

          {pestanaCurso === "temario" && (
            <section className="activities-panel">
              <div className="activities-header">
                <div>
                  <p>Contenido del sílabo</p>
                  <h2>Temario por semanas</h2>
                </div>

                <button type="button" onClick={abrirFormularioNuevoTema}>
                  + Agregar tema
                </button>
              </div>

              <article className="next-activity">
                <p>Avance del temario</p>
                <h2>
                  {temasCompletados} de {temario.length} temas completados
                </h2>
                <span>
                  Registra los contenidos del curso para que UniRuta pueda
                  organizar el estudio y relacionarlos con tus actividades.
                </span>
              </article>

              {mostrarFormularioTema && (
                <form className="activity-form" onSubmit={guardarTema}>
                  <h3>{temaEditandoId !== null ? "Editar tema" : "Nuevo tema"}</h3>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>Semana</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={semanaTema}
                        onChange={(event) => setSemanaTema(event.target.value)}
                        placeholder="Ejemplo: 4"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Tema principal</span>
                      <input
                        type="text"
                        value={tituloTema}
                        onChange={(event) => setTituloTema(event.target.value)}
                        placeholder="Ejemplo: Primera ley de la termodinámica"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Detalle opcional</span>
                      <input
                        type="text"
                        value={detalleTema}
                        onChange={(event) => setDetalleTema(event.target.value)}
                        placeholder="Subtemas, capítulos o indicaciones"
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={limpiarFormularioTema}
                    >
                      Cancelar
                    </button>

                    <button type="submit">
                      {temaEditandoId !== null
                        ? "Guardar cambios"
                        : "Guardar tema"}
                    </button>
                  </div>
                </form>
              )}

              {temasOrdenados.length === 0 ? (
                <article className="next-activity">
                  <p>Temario</p>
                  <h2>Todavía no hay temas registrados</h2>
                  <span>
                    Puedes copiarlos manualmente desde el sílabo. Más adelante
                    la IA completará esta sección al leer el PDF.
                  </span>
                </article>
              ) : (
                <div className="activities-list">
                  {temasOrdenados.map((tema) => (
                    <article className="activity-card" key={tema.id}>
                      <div>
                        <h3>{tema.titulo}</h3>
                        <p>{tema.detalle || "Sin detalle adicional"}</p>

                        <div className="activity-meta">
                          <span>Semana {tema.semana}</span>
                          <span
                            className={`status-badge ${
                              tema.estado === "Completado"
                                ? "completed-status"
                                : ""
                            }`}
                          >
                            {tema.estado}
                          </span>
                        </div>
                      </div>

                      <div className="activity-actions">
                        <button
                          type="button"
                          className="activity-status-button"
                          onClick={() => alternarEstadoTema(tema.id)}
                        >
                          {tema.estado === "Pendiente"
                            ? "Empezar"
                            : tema.estado === "En progreso"
                              ? "Completar"
                              : "Reabrir"}
                        </button>

                        <button
                          type="button"
                          className="edit-activity-button"
                          onClick={() => abrirFormularioEdicionTema(tema.id)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="delete-activity-button"
                          onClick={() => eliminarTema(tema.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {pestanaCurso === "configuracion" && (
            <section className="activities-panel">
              <div className="activities-header">
                <div>
                  <p>Configuración académica</p>
                  <h2>Sistema de evaluación</h2>
                </div>

                <button
                  type="button"
                  onClick={abrirFormularioNuevoComponente}
                >
                  + Agregar evaluación
                </button>
              </div>

              <article className="next-activity">
                <p>Peso total configurado</p>
                <h2>{pesoTotalComponentes.toFixed(2)} % de 100 %</h2>
                <span>
                  {Math.abs(pesoTotalComponentes - 100) < 0.001
                    ? "El sistema de evaluación está completo."
                    : pesoTotalComponentes < 100
                      ? `Todavía falta asignar ${(100 - pesoTotalComponentes).toFixed(
                          2,
                        )} %.`
                      : "El peso total supera 100 %."}
                </span>
              </article>

              <p className="notes-mode-message">
                Este editor básico permite crear evaluaciones directas como
                parciales, finales, prácticas y proyectos. Las fórmulas
                compuestas existentes, como EC1 y EC2, se conservan.
              </p>

              {mostrarFormularioComponente && (
                <form
                  className="activity-form"
                  onSubmit={guardarComponente}
                >
                  <h3>
                    {componenteEditandoId
                      ? "Editar componente"
                      : "Nueva evaluación"}
                  </h3>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>Nombre</span>
                      <input
                        type="text"
                        value={nombreComponente}
                        onChange={(event) =>
                          setNombreComponente(event.target.value)
                        }
                        placeholder="Ejemplo: Examen parcial"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Peso en la nota final (%)</span>
                      <input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={pesoComponente}
                        onChange={(event) =>
                          setPesoComponente(event.target.value)
                        }
                        placeholder="Ejemplo: 30"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Nota máxima</span>
                      <input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={notaMaximaComponente}
                        onChange={(event) =>
                          setNotaMaximaComponente(event.target.value)
                        }
                        disabled={
                          componenteEditandoId !== null &&
                          cursoSeleccionado.componentes.find(
                            (componente) =>
                              componente.id === componenteEditandoId,
                          )?.tipo !== "nota_directa"
                        }
                        required
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={limpiarFormularioComponente}
                    >
                      Cancelar
                    </button>

                    <button type="submit">
                      {componenteEditandoId
                        ? "Guardar cambios"
                        : "Guardar evaluación"}
                    </button>
                  </div>
                </form>
              )}

              {cursoSeleccionado.componentes.length === 0 ? (
                <article className="next-activity">
                  <p>Sistema de evaluación</p>
                  <h2>Todavía no hay evaluaciones registradas</h2>
                  <span>
                    Agrega los componentes indicados en el sílabo del curso.
                  </span>
                </article>
              ) : (
                <div className="activities-list">
                  {cursoSeleccionado.componentes.map((componente) => (
                    <article className="activity-card" key={componente.id}>
                      <div>
                        <h3>{componente.nombre}</h3>
                        <p>
                          {componente.tipo === "nota_directa"
                            ? "Evaluación directa"
                            : "Fórmula compuesta"}
                        </p>

                        <div className="activity-meta">
                          <span>Peso: {componente.peso ?? 0} %</span>

                          {componente.tipo === "nota_directa" && (
                            <span>
                              Nota máxima: {componente.notaMaxima ?? 20}
                            </span>
                          )}

                          {componente.hijos &&
                            componente.hijos.length > 0 && (
                              <span>
                                {componente.hijos.length} componentes internos
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="activity-actions">
                        <button
                          type="button"
                          className="edit-activity-button"
                          onClick={() =>
                            abrirFormularioEdicionComponente(componente.id)
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="delete-activity-button"
                          onClick={() => eliminarComponente(componente.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {pestanaCurso === "actividades" && (
            <section className="activities-panel">
              <div className="activities-header">
                <div>
                  <p>Organización del curso</p>
                  <h2>Actividades</h2>
                </div>

                <button type="button" onClick={abrirFormularioNuevo}>
                  + Agregar actividad
                </button>
              </div>

              {mostrarFormulario && (
                <form className="activity-form" onSubmit={agregarActividad}>
                  <h3>
                    {actividadEditandoId !== null
                      ? "Editar actividad"
                      : "Nueva actividad"}
                  </h3>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>Nombre</span>
                      <input
                        type="text"
                        value={nombreActividad}
                        onChange={(event) =>
                          setNombreActividad(event.target.value)
                        }
                        placeholder="Ejemplo: Quiz 1"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Tipo</span>
                      <select
                        value={tipoActividad}
                        onChange={(event) =>
                          setTipoActividad(event.target.value)
                        }
                      >
                        <option>Evaluación en aula</option>
                        <option>Tarea</option>
                        <option>Resolución de casos</option>
                        <option>Proyecto</option>
                        <option>Examen</option>
                        <option>Reunión</option>
                        <option>Sesión de estudio</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Semana</span>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        value={semanaActividad}
                        onChange={(event) =>
                          setSemanaActividad(event.target.value)
                        }
                        placeholder="1"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Fecha exacta opcional</span>
                      <input
                        type="date"
                        value={fechaActividad}
                        onChange={(event) =>
                          setFechaActividad(event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={limpiarFormulario}
                    >
                      Cancelar
                    </button>

                    <button type="submit">
                      {actividadEditandoId !== null
                        ? "Guardar cambios"
                        : "Guardar actividad"}
                    </button>
                  </div>
                </form>
              )}

              <div className="activities-list">
                {actividadesOrdenadas.map((actividad) => (
                  <article className="activity-card" key={actividad.id}>
                    <div>
                      <h3>{actividad.nombre}</h3>
                      <p>{actividad.tipo}</p>

                      <div className="activity-meta">
                        <span>{actividad.semana}</span>
                        <span>{actividad.fecha}</span>
                      </div>
                    </div>

                    <div className="activity-actions">
                      <span
                        className={`status-badge ${
                          actividad.estado === "Completada"
                            ? "completed-status"
                            : ""
                        }`}
                      >
                        {actividad.estado}
                      </span>

                      <button
                        type="button"
                        className="activity-status-button"
                        onClick={() => alternarEstadoActividad(actividad.id)}
                      >
                        {actividad.estado === "Completada"
                          ? "Reabrir"
                          : "Completar"}
                      </button>

                      <button
                        type="button"
                        className="edit-activity-button"
                        onClick={() => abrirFormularioEdicion(actividad.id)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="delete-activity-button"
                        onClick={() => eliminarActividad(actividad.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {pestanaCurso === "notas" && (
            <section className="grades-panel">
              <div className="grades-heading">
                <p>Calculadora del curso</p>
                <h2>Sistema de evaluación</h2>
                <span>
                  Nota final ={" "}
                  {cursoSeleccionado?.componentes
                    .map(
                      (componente) =>
                        `${componente.peso ?? 0} % ${componente.nombre}`,
                    )
                    .join(" + ")}
                </span>
              </div>

              <div className="final-grade-grid">
                <article className="final-grade-card">
                  <span>
                    {modoNotas === "simulacion"
                      ? "Nota final simulada"
                      : "Nota final provisional"}
                  </span>
                  <strong>{notaFinalMostrada.toFixed(2)}</strong>
                </article>

                <article className="final-grade-card">
                  <span>Nota final redondeada</span>
                  <strong>{notaFinalRedondeada}</strong>
                </article>

                <article className="final-grade-card">
                  <span>Porcentaje oficialmente evaluado</span>
                  <strong>{porcentajeEvaluado.toFixed(2)} %</strong>
                </article>

                <article className="final-grade-card">
                  <span>Estado</span>
                  <strong className="grade-status">{estadoMostrado}</strong>
                </article>
              </div>

              <section className="goal-calculator">
                <div className="goal-heading">
                  <div>
                    <p>Proyección académica</p>
                    <h3>Nota necesaria</h3>
                  </div>

                  <label className="goal-field">
                    <span>Meta final</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={metaNota}
                      onChange={(event) => actualizarMeta(event.target.value)}
                    />
                  </label>
                </div>

                <div className="goal-results">
                  <article>
                    <span>Puntos acumulados oficiales</span>
                    <strong>{puntosAcumulados.toFixed(2)}</strong>
                  </article>

                  <article>
                    <span>Porcentaje pendiente</span>
                    <strong>{porcentajePendiente.toFixed(2)} %</strong>
                  </article>
                </div>

                <div className="goal-message">
                  {promedioNecesario === null ? (
                    <strong>Ya no quedan evaluaciones pendientes.</strong>
                  ) : promedioNecesario <= 0 ? (
                    <strong>
                      La meta ya está asegurada con las notas oficiales.
                    </strong>
                  ) : promedioNecesario > 20 ? (
                    <strong>
                      La meta no es alcanzable con las evaluaciones restantes.
                    </strong>
                  ) : (
                    <>
                      <span>Promedio aproximado necesario en lo pendiente</span>
                      <strong>{promedioNecesario.toFixed(2)}</strong>
                    </>
                  )}
                </div>

                <small>
                  Es una estimación. Los redondeos internos de EC1 y EC2 pueden
                  modificar ligeramente el resultado final.
                </small>
              </section>

              <section className="dynamic-evaluations-check">
                <div className="dynamic-evaluations-heading">
                  <div>
                    <p>Calculadora dinámica</p>
                    <h3>
                      {modoNotas === "oficial"
                        ? "Mis notas oficiales"
                        : "Simulador de notas"}
                    </h3>
                  </div>

                  <strong>{evaluacionesDinamicas.length} evaluaciones</strong>
                </div>

                <div className="notes-mode-switch">
                  <button
                    type="button"
                    className={
                      modoNotas === "oficial"
                        ? "notes-mode-button active-notes-mode"
                        : "notes-mode-button"
                    }
                    onClick={activarModoOficial}
                  >
                    Notas oficiales
                  </button>

                  <button
                    type="button"
                    className={
                      modoNotas === "simulacion"
                        ? "notes-mode-button active-notes-mode"
                        : "notes-mode-button"
                    }
                    onClick={activarModoSimulacion}
                  >
                    Simulador
                  </button>
                </div>

                <div className="simulation-summary">
                  <article>
                    <span>Nota final oficial</span>
                    <strong>{notaFinalOficial.toFixed(2)}</strong>
                  </article>

                  {modoNotas === "simulacion" && (
                    <>
                      <article>
                        <span>Nota final simulada</span>
                        <strong>{notaFinalMostrada.toFixed(2)}</strong>
                      </article>

                      <article>
                        <span>Cambio estimado</span>
                        <strong>
                          {diferenciaSimulada >= 0 ? "+" : ""}
                          {diferenciaSimulada.toFixed(2)}
                        </strong>
                      </article>
                    </>
                  )}
                </div>

                {modoNotas === "oficial" ? (
                  <p className="notes-mode-message">
                    Ingresa únicamente las notas que ya fueron publicadas. Estas
                    notas se guardarán al cerrar o recargar la app.
                  </p>
                ) : (
                  <p className="notes-mode-message simulation-message">
                    Las notas oficiales están bloqueadas. Completa solamente las
                    evaluaciones pendientes para probar resultados. La
                    simulación no se guardará.
                  </p>
                )}

                <div className="grade-input-grid">
                  {evaluacionesDinamicas.map((evaluacion) => {
                    const valorOficial = notasOficiales[evaluacion.id];

                    const campoTieneNotaOficial = tieneNota(valorOficial);

                    const valorActivo = notasEnFormulario[evaluacion.id] ?? "";

                    const tieneNotaSimulada =
                      modoNotas === "simulacion" &&
                      !campoTieneNotaOficial &&
                      tieneNota(valorActivo);

                    const campoBloqueado =
                      modoNotas === "simulacion" && campoTieneNotaOficial;

                    return (
                      <label className="grade-input-field" key={evaluacion.id}>
                        <div className="dynamic-note-heading">
                          <span>{evaluacion.nombre}</span>

                          <small
                            className={
                              campoTieneNotaOficial
                                ? "note-origin official-note"
                                : tieneNotaSimulada
                                  ? "note-origin simulated-note"
                                  : "note-origin pending-note"
                            }
                          >
                            {campoTieneNotaOficial
                              ? "Oficial"
                              : tieneNotaSimulada
                                ? "Simulada"
                                : "Pendiente"}
                          </small>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={evaluacion.notaMaxima}
                          step="0.01"
                          value={String(valorActivo)}
                          disabled={campoBloqueado}
                          onChange={(event) =>
                            actualizarNota(
                              evaluacion.id,
                              event.target.value,
                              evaluacion.notaMaxima,
                            )
                          }
                          placeholder={`0 a ${evaluacion.notaMaxima}`}
                        />

                        <small>Máximo: {evaluacion.notaMaxima}</small>
                      </label>
                    );
                  })}
                </div>

                {modoNotas === "simulacion" && (
                  <button
                    type="button"
                    className="reset-simulation-button"
                    onClick={restablecerSimulacion}
                  >
                    Restablecer simulación
                  </button>
                )}
              </section>
            </section>
          )}
        </section>
      )}
    </main>
  );
}

export default App;