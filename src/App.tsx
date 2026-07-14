import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

import { configuracionEDO } from './data/edoConfig'
import { cursosIniciales } from './data/cursos'
import {
  calcularNotaFinal,
  obtenerEvaluacionesDirectas,
  type NotasPorId,
} from './utils/calcularNotas'

type Actividad = {
  id: number
  nombre: string
  tipo: string
  semana: string
  fecha: string
  estado: 'No iniciada' | 'Completada'
}

type ModoNotas = 'oficial' | 'simulacion'

const CLAVE_ACTIVIDADES = 'uniruta-actividades'
const CLAVE_NOTAS_OFICIALES = 'uniruta-notas-automaticas'
const CLAVE_META = 'uniruta-meta-nota'

const actividadesIniciales: Actividad[] = [
  {
    id: 1,
    nombre: 'EA1',
    tipo: 'Evaluación en aula',
    semana: 'Semana 2',
    fecha: 'Fecha exacta pendiente',
    estado: 'No iniciada',
  },
  {
    id: 2,
    nombre: 'RC1',
    tipo: 'Resolución de casos',
    semana: 'Semanas 3 y 4',
    fecha: 'Entrega: 19/04/2026',
    estado: 'No iniciada',
  },
  {
    id: 3,
    nombre: 'EA2',
    tipo: 'Evaluación en aula',
    semana: 'Semana 4',
    fecha: 'Fecha exacta pendiente',
    estado: 'No iniciada',
  },
  {
    id: 4,
    nombre: 'TA1',
    tipo: 'Tarea',
    semana: 'Semana 4',
    fecha: 'Entrega: 14/04/2026',
    estado: 'No iniciada',
  },
  {
    id: 5,
    nombre: 'EA3',
    tipo: 'Evaluación en aula',
    semana: 'Semana 6',
    fecha: 'Fecha exacta pendiente',
    estado: 'No iniciada',
  },
  {
    id: 6,
    nombre: 'RC2',
    tipo: 'Resolución de casos',
    semana: 'Semanas 6 y 7',
    fecha: 'Entrega: 10/05/2026',
    estado: 'No iniciada',
  },
  {
    id: 7,
    nombre: 'TA2',
    tipo: 'Tarea',
    semana: 'Semana 7',
    fecha: 'Entrega: 05/05/2026',
    estado: 'No iniciada',
  },
  {
    id: 8,
    nombre: 'P1',
    tipo: 'Proyecto ABP - primera exposición',
    semana: 'Semana 7',
    fecha: 'Fecha exacta pendiente',
    estado: 'No iniciada',
  },
  {
    id: 9,
    nombre: 'EP',
    tipo: 'Examen parcial',
    semana: 'Semana 7',
    fecha: 'Fecha exacta pendiente',
    estado: 'No iniciada',
  },
]

// La configuración decide qué evaluaciones existen y cuál es su nota máxima.
const evaluacionesDinamicas = obtenerEvaluacionesDirectas(
  configuracionEDO.componentes,
)

// Peso real de cada evaluación dentro de la nota final del curso.
// Se usa para calcular cuánto del curso ya fue evaluado y la proyección.
const pesosEvaluaciones: Record<string, number> = {
  ep: 20,
  ef: 30,

  ea1: 17.5 / 3,
  ea2: 17.5 / 3,
  ea3: 17.5 / 3,

  ta1: 1.25,
  ta2: 1.25,

  rc1: 1.25,
  rc2: 1.25,

  p1: 2.5,

  ea4: 5,
  ea5: 5,
  ea6: 5,

  ta3: 1.25,
  ta4: 1.25,

  rc3: 1.25,
  rc4: 1.25,

  p2: 1.25,
  p3: 3.75,
}

function tieneNota(valor: number | string | undefined) {
  return valor !== '' && valor !== undefined
}

function crearNotasIniciales(): NotasPorId {
  const notasVacias: NotasPorId = {}

  evaluacionesDinamicas.forEach((evaluacion) => {
    notasVacias[evaluacion.id] = ''
  })

  const notasGuardadas = localStorage.getItem(CLAVE_NOTAS_OFICIALES)

  if (notasGuardadas) {
    try {
      const notasParseadas = JSON.parse(notasGuardadas) as NotasPorId

      return {
        ...notasVacias,
        ...notasParseadas,
      }
    } catch {
      localStorage.removeItem(CLAVE_NOTAS_OFICIALES)
    }
  }

  // Compatibilidad con las notas que se guardaron antes en claves individuales.
  evaluacionesDinamicas.forEach((evaluacion) => {
    notasVacias[evaluacion.id] =
      localStorage.getItem(`uniruta-nota-${evaluacion.id}`) ?? ''
  })

  return notasVacias
}

function App() {
  // ------------------------------------------------------------
  // 1. Navegación
  // ------------------------------------------------------------
  const [vista, setVista] = useState('inicio')
  const [pestanaCurso, setPestanaCurso] = useState('resumen')

  // ------------------------------------------------------------
  // 2. Actividades
  // ------------------------------------------------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreActividad, setNombreActividad] = useState('')
  const [tipoActividad, setTipoActividad] = useState('Tarea')
  const [semanaActividad, setSemanaActividad] = useState('')
  const [fechaActividad, setFechaActividad] = useState('')
  const [actividadEditandoId, setActividadEditandoId] = useState<number | null>(
    null,
  )

  const [actividades, setActividades] = useState<Actividad[]>(() => {
    const actividadesGuardadas = localStorage.getItem(CLAVE_ACTIVIDADES)

    if (actividadesGuardadas) {
      try {
        return JSON.parse(actividadesGuardadas) as Actividad[]
      } catch {
        localStorage.removeItem(CLAVE_ACTIVIDADES)
      }
    }

    return actividadesIniciales
  })

  // ------------------------------------------------------------
  // 3. Notas oficiales y simulación
  // ------------------------------------------------------------
  const [notasOficiales, setNotasOficiales] =
    useState<NotasPorId>(crearNotasIniciales)

  const [modoNotas, setModoNotas] = useState<ModoNotas>('oficial')

  // Las notas simuladas viven solo en memoria: no se guardan en localStorage.
  const [notasSimuladas, setNotasSimuladas] =
    useState<NotasPorId>({})

  const [metaNota, setMetaNota] = useState(
    () => localStorage.getItem(CLAVE_META) ?? '10.5',
  )

  // ------------------------------------------------------------
  // 4. Persistencia
  // ------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem(
      CLAVE_ACTIVIDADES,
      JSON.stringify(actividades),
    )
  }, [actividades])

  useEffect(() => {
    localStorage.setItem(
      CLAVE_NOTAS_OFICIALES,
      JSON.stringify(notasOficiales),
    )
  }, [notasOficiales])

  useEffect(() => {
    localStorage.setItem(CLAVE_META, metaNota)
  }, [metaNota])

  // ------------------------------------------------------------
  // 5. Cálculos de actividades
  // ------------------------------------------------------------
  const pendientes = actividades.filter(
    (actividad) => actividad.estado !== 'Completada',
  ).length

  const completadas = actividades.filter(
    (actividad) => actividad.estado === 'Completada',
  ).length

  function obtenerNumeroSemana(textoSemana: string) {
    const coincidencia = textoSemana.match(/\d+/)

    return coincidencia ? Number(coincidencia[0]) : 999
  }

  const actividadesOrdenadas = [...actividades].sort(
    (actividadA, actividadB) =>
      obtenerNumeroSemana(actividadA.semana) -
      obtenerNumeroSemana(actividadB.semana),
  )

  const proximaActividad = actividadesOrdenadas.find(
    (actividad) => actividad.estado !== 'Completada',
  )

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
                actividad.estado === 'Completada'
                  ? 'No iniciada'
                  : 'Completada',
            }
          : actividad,
      ),
    )
  }

  function eliminarActividad(id: number) {
    const actividadSeleccionada = actividades.find(
      (actividad) => actividad.id === id,
    )

    if (!actividadSeleccionada) {
      return
    }

    const confirmarEliminacion = window.confirm(
      `¿Seguro que deseas eliminar "${actividadSeleccionada.nombre}"?`,
    )

    if (!confirmarEliminacion) {
      return
    }

    setActividades((actividadesActuales) =>
      actividadesActuales.filter((actividad) => actividad.id !== id),
    )
  }

  function formatearFecha(fecha: string) {
    const [anio, mes, dia] = fecha.split('-')

    return `${dia}/${mes}/${anio}`
  }

  function convertirFechaParaInput(fechaGuardada: string) {
    const coincidencia = fechaGuardada.match(
      /(\d{2})\/(\d{2})\/(\d{4})/,
    )

    if (!coincidencia) {
      return ''
    }

    const [, dia, mes, anio] = coincidencia

    return `${anio}-${mes}-${dia}`
  }

  function limpiarFormulario() {
    setNombreActividad('')
    setTipoActividad('Tarea')
    setSemanaActividad('')
    setFechaActividad('')
    setActividadEditandoId(null)
    setMostrarFormulario(false)
  }

  function abrirFormularioNuevo() {
    limpiarFormulario()
    setMostrarFormulario(true)
  }

  function abrirFormularioEdicion(id: number) {
    const actividadSeleccionada = actividades.find(
      (actividad) => actividad.id === id,
    )

    if (!actividadSeleccionada) {
      return
    }

    setNombreActividad(actividadSeleccionada.nombre)
    setTipoActividad(actividadSeleccionada.tipo)
    setSemanaActividad(
      String(obtenerNumeroSemana(actividadSeleccionada.semana)),
    )
    setFechaActividad(
      convertirFechaParaInput(actividadSeleccionada.fecha),
    )
    setActividadEditandoId(id)
    setMostrarFormulario(true)
  }

  function agregarActividad(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nombreActividad.trim() || !semanaActividad) {
      return
    }

    const datosActividad = {
      nombre: nombreActividad.trim(),
      tipo: tipoActividad,
      semana: `Semana ${semanaActividad}`,
      fecha: fechaActividad
        ? `Fecha: ${formatearFecha(fechaActividad)}`
        : 'Fecha exacta pendiente',
    }

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
      )
    } else {
      const nuevaActividad: Actividad = {
        id: Date.now(),
        ...datosActividad,
        estado: 'No iniciada',
      }

      setActividades((actividadesActuales) => [
        ...actividadesActuales,
        nuevaActividad,
      ])
    }

    limpiarFormulario()
  }

  // ------------------------------------------------------------
  // 7. Funciones de notas
  // ------------------------------------------------------------
  function actualizarMeta(valor: string) {
    if (valor === '') {
      setMetaNota('')
      return
    }

    const numero = Number(valor)

    if (Number.isFinite(numero) && numero >= 0 && numero <= 20) {
      setMetaNota(valor)
    }
  }

  function actualizarNota(
    id: string,
    valor: string,
    notaMaxima: number,
  ) {
    const valorOficial = notasOficiales[id]
    const campoTieneNotaOficial = tieneNota(valorOficial)

    // En simulación, las notas oficiales quedan bloqueadas.
    if (modoNotas === 'simulacion' && campoTieneNotaOficial) {
      return
    }

    if (valor !== '') {
      const numero = Number(valor)

      if (
        !Number.isFinite(numero) ||
        numero < 0 ||
        numero > notaMaxima
      ) {
        return
      }
    }

    if (modoNotas === 'simulacion') {
      setNotasSimuladas((notasActuales) => ({
        ...notasActuales,
        [id]: valor,
      }))

      return
    }

    setNotasOficiales((notasActuales) => ({
      ...notasActuales,
      [id]: valor,
    }))
  }

  function activarModoOficial() {
    setModoNotas('oficial')
  }

  function activarModoSimulacion() {
    // Cada simulación empieza como una copia de las notas oficiales.
    setNotasSimuladas({
      ...notasOficiales,
    })
    setModoNotas('simulacion')
  }

  function restablecerSimulacion() {
    setNotasSimuladas({
      ...notasOficiales,
    })
  }

  // ------------------------------------------------------------
  // 8. Cálculos académicos
  // ------------------------------------------------------------
  const notasEnFormulario =
    modoNotas === 'simulacion'
      ? notasSimuladas
      : notasOficiales

  const notaFinalOficial = calcularNotaFinal(
    configuracionEDO.componentes,
    notasOficiales,
    configuracionEDO.notaMaxima,
  )

  const notaFinalMostrada = calcularNotaFinal(
    configuracionEDO.componentes,
    notasEnFormulario,
    configuracionEDO.notaMaxima,
  )

  const notaFinalRedondeada = Math.round(notaFinalMostrada)
  const diferenciaSimulada =
    notaFinalMostrada - notaFinalOficial

  const porcentajeEvaluado = evaluacionesDinamicas.reduce(
    (total, evaluacion) => {
      if (!tieneNota(notasOficiales[evaluacion.id])) {
        return total
      }

      return total + (pesosEvaluaciones[evaluacion.id] ?? 0)
    },
    0,
  )

  const puntosAcumulados = evaluacionesDinamicas.reduce(
    (total, evaluacion) => {
      const valor = notasOficiales[evaluacion.id]

      if (!tieneNota(valor)) {
        return total
      }

      const nota = Number(valor)
      const peso = pesosEvaluaciones[evaluacion.id] ?? 0

      const aporte =
        (nota / evaluacion.notaMaxima) *
        20 *
        (peso / 100)

      return total + aporte
    },
    0,
  )

  const porcentajePendiente = Math.max(
    0,
    100 - porcentajeEvaluado,
  )

  const promedioActual =
    porcentajeEvaluado > 0
      ? puntosAcumulados / (porcentajeEvaluado / 100)
      : null

  const metaNumerica = Number(metaNota || 0)

  const promedioNecesario =
    porcentajePendiente > 0
      ? (metaNumerica - puntosAcumulados) /
        (porcentajePendiente / 100)
      : null

  const estadoMostrado =
    modoNotas === 'simulacion'
      ? notaFinalMostrada >= configuracionEDO.notaMinima
        ? 'Aprobado en simulación'
        : `No alcanza ${configuracionEDO.notaMinima}`
      : porcentajeEvaluado === 0
        ? 'Sin notas'
        : porcentajeEvaluado < 100
          ? 'En progreso'
          : notaFinalOficial >= configuracionEDO.notaMinima
            ? 'Aprobado'
            : 'Desaprobado'

// Información que se mostrará en las tarjetas del panel.
// Por ahora EDO es el único curso que tiene notas y actividades conectadas.
const cursosPanel = cursosIniciales.map((curso) => {
  const esCursoEDO =
    curso.id === configuracionEDO.id

  return {
    id: curso.id,
    nombre: curso.nombre,
    codigo: curso.codigo ?? 'Sin código',
    ciclo: curso.ciclo,

    promedio:
      esCursoEDO && promedioActual !== null
        ? promedioActual.toFixed(2)
        : 'Sin notas',

    pendientes:
      esCursoEDO
        ? pendientes
        : 0,

    proximaActividad:
      esCursoEDO && proximaActividad
        ? proximaActividad.nombre
        : 'Sin actividades pendientes',
  }
})

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h2>UniRuta</h2>
          <p>Planificación académica universitaria</p>
        </div>

        <span>Ciclo {configuracionEDO.ciclo}</span>
      </header>

      {vista === 'inicio' && (
        <section className="welcome">
          <p>Panel principal</p>
          <h1>Organiza tu ciclo universitario</h1>
          <p>
            Controla tus cursos, actividades, calendario y notas desde un solo
            lugar.
          </p>

          <button type="button" onClick={() => setVista('panel')}>
            Comenzar
          </button>
        </section>
      )}

      {vista === 'panel' && (
        <section className="welcome">
          <p>Semana actual</p>
          <h1>Semana 1 de 16</h1>
          <p>
            Aquí aparecerá el resumen de tus actividades, cursos y evaluaciones.
          </p>

          <div className="summary-grid">
            <article className="summary-card">
              <strong>{pendientes}</strong>
              <span>Pendientes</span>
            </article>

            <article className="summary-card">
              <strong>0</strong>
              <span>Atrasadas</span>
            </article>

            <article className="summary-card">
              <strong>{completadas}</strong>
              <span>Completadas</span>
            </article>
          </div>

          <section className="courses-section">
            <h2>Mis cursos</h2>

            <div className="course-list">
              {cursosPanel.map((curso) => (
                <article
                  className="course-card"
                  key={curso.id}
                >
                  <div>
                    <h3>{curso.nombre}</h3>

                    <p>
                      {curso.codigo} · Ciclo {curso.ciclo}
                    </p>

                    <p>
                      Promedio evaluado: {curso.promedio}
                    </p>

                    <p>
                      Pendientes: {curso.pendientes}
                    </p>

                    <p>
                      Próxima actividad: {curso.proximaActividad}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setVista('curso')
                      setPestanaCurso('resumen')
                    }}
                  >
                    Abrir curso
                  </button>
                </article>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setVista('inicio')}
          >
            Volver
          </button>
        </section>
      )}

      {vista === 'curso' && (
        <section className="course-detail">
          <button
            type="button"
            className="back-button"
            onClick={() => setVista('panel')}
          >
            ← Volver al panel
          </button>

          <div className="course-heading">
            <p>Curso</p>
            <h1>{configuracionEDO.nombre}</h1>
            <span>En curso</span>
          </div>

          <nav className="course-tabs">
            <button
              type="button"
              className={pestanaCurso === 'resumen' ? 'active-tab' : ''}
              onClick={() => setPestanaCurso('resumen')}
            >
              Resumen
            </button>

            <button
              type="button"
              className={pestanaCurso === 'actividades' ? 'active-tab' : ''}
              onClick={() => setPestanaCurso('actividades')}
            >
              Actividades
            </button>

            <button
              type="button"
              className={pestanaCurso === 'notas' ? 'active-tab' : ''}
              onClick={() => setPestanaCurso('notas')}
            >
              Notas
            </button>

            <button type="button" disabled>
              Calendario
            </button>
          </nav>

          {pestanaCurso === 'resumen' && (
            <>
              <div className="course-summary-grid">
                <article className="summary-card">
                  <strong>
                    {promedioActual === null
                      ? '—'
                      : promedioActual.toFixed(2)}
                  </strong>
                  <span>Promedio evaluado</span>
                </article>

                <article className="summary-card">
                  <strong>{porcentajeEvaluado.toFixed(2)} %</strong>
                  <span>Ya evaluado</span>
                </article>

                <article className="summary-card">
                  <strong>{pendientes}</strong>
                  <span>Actividades pendientes</span>
                </article>
              </div>

              {proximaActividad ? (
                <article className="next-activity">
                  <p>Próxima actividad</p>
                  <h2>
                    {proximaActividad.nombre} — {proximaActividad.tipo}
                  </h2>
                  <span>
                    {proximaActividad.semana} · {proximaActividad.fecha}
                  </span>
                </article>
              ) : (
                <article className="next-activity">
                  <p>Próxima actividad</p>
                  <h2>No tienes actividades pendientes</h2>
                  <span>
                    Has completado todas las actividades registradas.
                  </span>
                </article>
              )}

              <section className="grade-components">
                <h2>Componentes de la nota</h2>

                {configuracionEDO.componentes.map((componente) => (
                  <div className="grade-component" key={componente.id}>
                    <span>{componente.nombre}</span>
                    <strong>{componente.peso ?? 0} %</strong>
                  </div>
                ))}
              </section>
            </>
          )}

          {pestanaCurso === 'actividades' && (
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
                <form
                  className="activity-form"
                  onSubmit={agregarActividad}
                >
                  <h3>
                    {actividadEditandoId !== null
                      ? 'Editar actividad'
                      : 'Nueva actividad'}
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
                        ? 'Guardar cambios'
                        : 'Guardar actividad'}
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
                          actividad.estado === 'Completada'
                            ? 'completed-status'
                            : ''
                        }`}
                      >
                        {actividad.estado}
                      </span>

                      <button
                        type="button"
                        className="activity-status-button"
                        onClick={() =>
                          alternarEstadoActividad(actividad.id)
                        }
                      >
                        {actividad.estado === 'Completada'
                          ? 'Reabrir'
                          : 'Completar'}
                      </button>

                      <button
                        type="button"
                        className="edit-activity-button"
                        onClick={() =>
                          abrirFormularioEdicion(actividad.id)
                        }
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

          {pestanaCurso === 'notas' && (
            <section className="grades-panel">
              <div className="grades-heading">
                <p>Calculadora del curso</p>
                <h2>Sistema de evaluación</h2>
                <span>
                  Nota final = 20 % EP + 30 % EF + 25 % EC1 + 25 % EC2
                </span>
              </div>

              <div className="final-grade-grid">
                <article className="final-grade-card">
                  <span>
                    {modoNotas === 'simulacion'
                      ? 'Nota final simulada'
                      : 'Nota final provisional'}
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
                      onChange={(event) =>
                        actualizarMeta(event.target.value)
                      }
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
                    <strong>
                      Ya no quedan evaluaciones pendientes.
                    </strong>
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
                      <span>
                        Promedio aproximado necesario en lo pendiente
                      </span>
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
                      {modoNotas === 'oficial'
                        ? 'Mis notas oficiales'
                        : 'Simulador de notas'}
                    </h3>
                  </div>

                  <strong>
                    {evaluacionesDinamicas.length} evaluaciones
                  </strong>
                </div>

                <div className="notes-mode-switch">
                  <button
                    type="button"
                    className={
                      modoNotas === 'oficial'
                        ? 'notes-mode-button active-notes-mode'
                        : 'notes-mode-button'
                    }
                    onClick={activarModoOficial}
                  >
                    Notas oficiales
                  </button>

                  <button
                    type="button"
                    className={
                      modoNotas === 'simulacion'
                        ? 'notes-mode-button active-notes-mode'
                        : 'notes-mode-button'
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

                  {modoNotas === 'simulacion' && (
                    <>
                      <article>
                        <span>Nota final simulada</span>
                        <strong>{notaFinalMostrada.toFixed(2)}</strong>
                      </article>

                      <article>
                        <span>Cambio estimado</span>
                        <strong>
                          {diferenciaSimulada >= 0 ? '+' : ''}
                          {diferenciaSimulada.toFixed(2)}
                        </strong>
                      </article>
                    </>
                  )}
                </div>

                {modoNotas === 'oficial' ? (
                  <p className="notes-mode-message">
                    Ingresa únicamente las notas que ya fueron publicadas.
                    Estas notas se guardarán al cerrar o recargar la app.
                  </p>
                ) : (
                  <p className="notes-mode-message simulation-message">
                    Las notas oficiales están bloqueadas. Completa solamente
                    las evaluaciones pendientes para probar resultados. La
                    simulación no se guardará.
                  </p>
                )}

                <div className="grade-input-grid">
                  {evaluacionesDinamicas.map((evaluacion) => {
                    const valorOficial =
                      notasOficiales[evaluacion.id]

                    const campoTieneNotaOficial =
                      tieneNota(valorOficial)

                    const valorActivo =
                      notasEnFormulario[evaluacion.id] ?? ''

                    const tieneNotaSimulada =
                      modoNotas === 'simulacion' &&
                      !campoTieneNotaOficial &&
                      tieneNota(valorActivo)

                    const campoBloqueado =
                      modoNotas === 'simulacion' &&
                      campoTieneNotaOficial

                    return (
                      <label
                        className="grade-input-field"
                        key={evaluacion.id}
                      >
                        <div className="dynamic-note-heading">
                          <span>{evaluacion.nombre}</span>

                          <small
                            className={
                              campoTieneNotaOficial
                                ? 'note-origin official-note'
                                : tieneNotaSimulada
                                  ? 'note-origin simulated-note'
                                  : 'note-origin pending-note'
                            }
                          >
                            {campoTieneNotaOficial
                              ? 'Oficial'
                              : tieneNotaSimulada
                                ? 'Simulada'
                                : 'Pendiente'}
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

                        <small>
                          Máximo: {evaluacion.notaMaxima}
                        </small>
                      </label>
                    )
                  })}
                </div>

                {modoNotas === 'simulacion' && (
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
  )
}

export default App