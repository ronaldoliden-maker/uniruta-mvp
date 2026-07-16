import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

import Topbar from "./components/Topbar";
import Inicio from "./components/Inicio";
import EncabezadoCurso from "./components/EncabezadoCurso";
import ResumenCurso from "./components/ResumenCurso";
import TemarioCurso from "./components/TemarioCurso";
import ActividadesCurso from "./components/ActividadesCurso";
import ResumenNotasCurso from "./components/ResumenNotasCurso";
import ProyeccionNotaCurso from "./components/ProyeccionNotaCurso";
import CalculadoraNotasCurso from "./components/CalculadoraNotasCurso";
import SistemaEvaluacionCurso from "./components/SistemaEvaluacionCurso";
import PanelPrincipal from "./components/PanelPrincipal";
import useNavegacion from "./hooks/useNavegacion";
import ImportarSilaboCurso from "./components/ImportarSilaboCurso";
import PlanEstudioCurso from "./components/PlanEstudioCurso";
import AgendaSemanalGlobal from "./components/AgendaSemanalGlobal";
import RespaldoDatos from "./components/RespaldoDatos";

import type { PropuestaSilabo } from "./types/propuestaSilabo";

import {
  combinarActividadesSinDuplicados,
  convertirPropuestaSilabo,
} from "./utils/convertirPropuestaSilabo";

import NavegacionCurso from "./components/NavegacionCurso";

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
  const {
    vista,
    pestanaCurso,
    setPestanaCurso,
    irAlInicio,
    irAlPanel,
    abrirVistaCurso,
  } = useNavegacion();

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
    const notaMaxima = evaluacion.notaMaxima ?? 20;

    const aporte = (nota / notaMaxima) * 20 * (peso / 100);

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
        const notaMaxima = evaluacion.notaMaxima ?? 20;

        return total + (nota / notaMaxima) * 20 * (peso / 100);
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

    abrirVistaCurso();
  }

  function abrirPlanCurso(cursoId: string) {
    abrirCurso(cursoId);
    setPestanaCurso("plan");
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
    localStorage.removeItem(
      `uniruta-curso-${cursoId}-plan-estudio`,
    );

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

  function guardarPropuestaSilabo(
    propuesta: PropuestaSilabo,
  ) {
    if (!cursoSeleccionado) {
      return false;
    }
  
    const datosImportados =
      convertirPropuestaSilabo(
        propuesta,
        cursoSeleccionado.id,
      );
  
    const mensajeSemanas =
      datosImportados.temasConSemanaAutomatica > 0
        ? `\n\n${datosImportados.temasConSemanaAutomatica} temas no tenían semana y se asignarán consecutivamente desde la semana 1.`
        : "";
  
    const confirmar = window.confirm(
      `Se actualizarán el nombre, código, nota mínima, sistema de evaluación y temario de "${cursoSeleccionado.nombre}".\n\nLas notas oficiales actuales se borrarán porque cambiará el sistema de evaluación. Las actividades manuales se conservarán y se agregarán las evaluaciones con semana detectada.${mensajeSemanas}\n\n¿Deseas continuar?`,
    );
  
    if (!confirmar) {
      return false;
    }
  
    setCursosRegistrados((cursosActuales) =>
      cursosActuales.map((curso) =>
        curso.id === cursoSeleccionado.id
          ? {
              ...curso,
              nombre: datosImportados.nombreCurso,
              codigo: datosImportados.codigoCurso,
              notaMinima: datosImportados.notaMinima,
              componentes:
                datosImportados.componentes,
            }
          : curso,
      ),
    );
  
    setTemario(datosImportados.temas);
  
    setActividades((actividadesActuales) =>
      combinarActividadesSinDuplicados(
        actividadesActuales,
        datosImportados.actividades,
      ),
    );
  
    setNotasOficiales({});
    setNotasSimuladas({});
    setModoNotas("oficial");
    setPestanaCurso("resumen");
  
    return true;
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
        <Inicio onComenzar={irAlPanel} />
      )}

      {vista === "panel" && (
        <>
          <PanelPrincipal
            pendientesGlobales={
              resumenActividadesGlobal.pendientes
            }
            atrasadasGlobales={0}
            completadasGlobales={
              resumenActividadesGlobal.completadas
            }

            cursos={cursosPanel}

            mostrarFormularioCurso={
              mostrarFormularioCurso
            }
            cursoEditandoId={cursoEditandoId}

            nombreCurso={nombreCursoNuevo}
            codigoCurso={codigoCursoNuevo}
            cicloCurso={cicloCursoNuevo}
            notaMinimaCurso={notaMinimaCursoNueva}

            onCambiarNombreCurso={
              setNombreCursoNuevo
            }
            onCambiarCodigoCurso={
              setCodigoCursoNuevo
            }
            onCambiarCicloCurso={
              setCicloCursoNuevo
            }
            onCambiarNotaMinimaCurso={
              setNotaMinimaCursoNueva
            }

            onAbrirFormularioNuevoCurso={
              abrirFormularioNuevoCurso
            }
            onGuardarCurso={agregarCurso}
            onCancelarFormularioCurso={
              limpiarFormularioCurso
            }

            onAbrirCurso={abrirCurso}
            onEditarCurso={
              abrirFormularioEdicionCurso
            }
            onEliminarCurso={eliminarCurso}

            onVolver={irAlInicio}
          />

          <AgendaSemanalGlobal
            cursos={cursosRegistrados}
            onAbrirPlan={abrirPlanCurso}
          />
        <RespaldoDatos />
        </>
      )}

      {vista === "curso" && cursoSeleccionado && (
        <section className="course-detail">
          <button
            type="button"
            className="back-button"
            onClick={irAlPanel}
          >
            ← Volver al panel
          </button>

          <EncabezadoCurso curso={cursoSeleccionado} />

          <NavegacionCurso
            pestanaActiva={pestanaCurso}
            onCambiar={setPestanaCurso}
          />

          {pestanaCurso === "silabo" && (
            <ImportarSilaboCurso
              nombreCurso={cursoSeleccionado.nombre}
              onGuardarPropuesta={
                guardarPropuestaSilabo
              }
            />
          )}

          {pestanaCurso === "plan" && (
            <PlanEstudioCurso
              key={cursoSeleccionado.id}
              cursoId={cursoSeleccionado.id}
              nombreCurso={cursoSeleccionado.nombre}
              temario={temario}
              actividades={actividades}
              componentes={cursoSeleccionado.componentes}
            />
          )}

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
            <TemarioCurso
              temario={temario}
              temasOrdenados={temasOrdenados}
              temasCompletados={temasCompletados}
              mostrarFormulario={mostrarFormularioTema}
              temaEditandoId={temaEditandoId}
              semanaTema={semanaTema}
              tituloTema={tituloTema}
              detalleTema={detalleTema}
              onCambiarSemana={setSemanaTema}
              onCambiarTitulo={setTituloTema}
              onCambiarDetalle={setDetalleTema}
              onAbrirNuevo={abrirFormularioNuevoTema}
              onCancelar={limpiarFormularioTema}
              onGuardar={guardarTema}
              onCambiarEstado={alternarEstadoTema}
              onEditar={abrirFormularioEdicionTema}
              onEliminar={eliminarTema}
            />
          )}

          {pestanaCurso === "actividades" && (
            <ActividadesCurso
              actividades={actividadesOrdenadas}
              mostrarFormulario={mostrarFormulario}
              actividadEditandoId={actividadEditandoId}
              nombreActividad={nombreActividad}
              tipoActividad={tipoActividad}
              semanaActividad={semanaActividad}
              fechaActividad={fechaActividad}
              onCambiarNombre={setNombreActividad}
              onCambiarTipo={setTipoActividad}
              onCambiarSemana={setSemanaActividad}
              onCambiarFecha={setFechaActividad}
              onAbrirNueva={abrirFormularioNuevo}
              onCancelar={limpiarFormulario}
              onGuardar={agregarActividad}
              onCambiarEstado={alternarEstadoActividad}
              onEditar={abrirFormularioEdicion}
              onEliminar={eliminarActividad}
            />
          )}

          {pestanaCurso === "notas" && (
            <section className="grades-panel">
              <ResumenNotasCurso
                curso={cursoSeleccionado}
                esSimulacion={modoNotas === "simulacion"}
                notaFinalMostrada={notaFinalMostrada}
                notaFinalRedondeada={notaFinalRedondeada}
                porcentajeEvaluado={porcentajeEvaluado}
                estadoMostrado={estadoMostrado}
              />

              <ProyeccionNotaCurso
                metaNota={metaNota}
                notaMaxima={cursoSeleccionado.notaMaxima}
                puntosAcumulados={puntosAcumulados}
                porcentajePendiente={porcentajePendiente}
                promedioNecesario={promedioNecesario}
                onCambiarMeta={actualizarMeta}
              />

              <CalculadoraNotasCurso
                modo={modoNotas}
                evaluaciones={evaluacionesDinamicas}
                notasOficiales={notasOficiales}
                notasEnFormulario={notasEnFormulario}
                notaFinalOficial={notaFinalOficial}
                notaFinalMostrada={notaFinalMostrada}
                diferenciaSimulada={diferenciaSimulada}
                onActivarOficial={activarModoOficial}
                onActivarSimulacion={activarModoSimulacion}
                onActualizarNota={actualizarNota}
                onRestablecerSimulacion={restablecerSimulacion}
              />
            </section>
          )}

          {pestanaCurso === "configuracion" && (
            <SistemaEvaluacionCurso
              componentes={cursoSeleccionado.componentes}
              pesoTotal={pesoTotalComponentes}
              mostrarFormulario={mostrarFormularioComponente}
              componenteEditandoId={componenteEditandoId}
              nombreComponente={nombreComponente}
              pesoComponente={pesoComponente}
              notaMaximaComponente={notaMaximaComponente}
              onCambiarNombre={setNombreComponente}
              onCambiarPeso={setPesoComponente}
              onCambiarNotaMaxima={setNotaMaximaComponente}
              onAbrirNuevo={abrirFormularioNuevoComponente}
              onCancelar={limpiarFormularioComponente}
              onGuardar={guardarComponente}
              onEditar={abrirFormularioEdicionComponente}
              onEliminar={eliminarComponente}
            />
          )}
        </section>
      )}
    </main>
  );
}

export default App;