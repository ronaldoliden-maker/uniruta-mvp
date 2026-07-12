import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Actividad = {
  id: number
  nombre: string
  tipo: string
  semana: string
  fecha: string
  estado: 'No iniciada' | 'Completada'
}

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

function App() {
  const [vista, setVista] = useState('inicio')
  const [pestanaCurso, setPestanaCurso] = useState('resumen')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreActividad, setNombreActividad] = useState('')
  const [tipoActividad, setTipoActividad] = useState('Tarea')
  const [semanaActividad, setSemanaActividad] = useState('')
  const [fechaActividad, setFechaActividad] = useState('')
  const [actividadEditandoId, setActividadEditandoId] = useState<number | null>(
    null,
  )

  const [notaEA1, setNotaEA1] = useState(
    () => localStorage.getItem('uniruta-nota-ea1') ?? '',
  )
  
  const [notaEA2, setNotaEA2] = useState(
    () => localStorage.getItem('uniruta-nota-ea2') ?? '',
  )
  
  const [notaEA3, setNotaEA3] = useState(
    () => localStorage.getItem('uniruta-nota-ea3') ?? '',
  )

  const [notaTA1, setNotaTA1] = useState(
    () => localStorage.getItem('uniruta-nota-ta1') ?? '',
  )
  
  const [notaTA2, setNotaTA2] = useState(
    () => localStorage.getItem('uniruta-nota-ta2') ?? '',
  )


  const [notaRC1, setNotaRC1] = useState(
    () => localStorage.getItem('uniruta-nota-rc1') ?? '',
  )
  
  const [notaRC2, setNotaRC2] = useState(
    () => localStorage.getItem('uniruta-nota-rc2') ?? '',
  )
  
  const [notaP1, setNotaP1] = useState(
    () => localStorage.getItem('uniruta-nota-p1') ?? '',
  )

  const [notaEA4, setNotaEA4] = useState(
    () => localStorage.getItem('uniruta-nota-ea4') ?? '',
  )
  
  const [notaEA5, setNotaEA5] = useState(
    () => localStorage.getItem('uniruta-nota-ea5') ?? '',
  )
  
  const [notaEA6, setNotaEA6] = useState(
    () => localStorage.getItem('uniruta-nota-ea6') ?? '',
  )


  const [notaTA3, setNotaTA3] = useState(
    () => localStorage.getItem('uniruta-nota-ta3') ?? '',
  )
  
  const [notaTA4, setNotaTA4] = useState(
    () => localStorage.getItem('uniruta-nota-ta4') ?? '',
  )

  const [notaRC3, setNotaRC3] = useState(
    () => localStorage.getItem('uniruta-nota-rc3') ?? '',
  )
  
  const [notaRC4, setNotaRC4] = useState(
    () => localStorage.getItem('uniruta-nota-rc4') ?? '',
  )

  const [notaP2, setNotaP2] = useState(
    () => localStorage.getItem('uniruta-nota-p2') ?? '',
  )
  
  const [notaP3, setNotaP3] = useState(
    () => localStorage.getItem('uniruta-nota-p3') ?? '',
  )

  const [actividades, setActividades] = useState<Actividad[]>(() => {
    const actividadesGuardadas = localStorage.getItem('uniruta-actividades')

    if (actividadesGuardadas) {
      try {
        return JSON.parse(actividadesGuardadas) as Actividad[]
      } catch {
        localStorage.removeItem('uniruta-actividades')
      }
    }

    return actividadesIniciales
  })

  useEffect(() => {
    localStorage.setItem(
      'uniruta-actividades',
      JSON.stringify(actividades),
    )
  }, [actividades])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-ea1', notaEA1)
    localStorage.setItem('uniruta-nota-ea2', notaEA2)
    localStorage.setItem('uniruta-nota-ea3', notaEA3)
  }, [notaEA1, notaEA2, notaEA3])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-ta1', notaTA1)
    localStorage.setItem('uniruta-nota-ta2', notaTA2)
  }, [notaTA1, notaTA2])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-rc1', notaRC1)
    localStorage.setItem('uniruta-nota-rc2', notaRC2)
    localStorage.setItem('uniruta-nota-p1', notaP1)
  }, [notaRC1, notaRC2, notaP1])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-ea4', notaEA4)
    localStorage.setItem('uniruta-nota-ea5', notaEA5)
    localStorage.setItem('uniruta-nota-ea6', notaEA6)
  }, [notaEA4, notaEA5, notaEA6])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-ta3', notaTA3)
    localStorage.setItem('uniruta-nota-ta4', notaTA4)
  }, [notaTA3, notaTA4])

  useEffect(() => {
    localStorage.setItem('uniruta-nota-rc3', notaRC3)
    localStorage.setItem('uniruta-nota-rc4', notaRC4)
  }, [notaRC3, notaRC4])


  useEffect(() => {
    localStorage.setItem('uniruta-nota-p2', notaP2)
    localStorage.setItem('uniruta-nota-p3', notaP3)
  }, [notaP2, notaP3])

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

  const cursos = [
    {
      id: 1,
      nombre: 'Ecuaciones Diferenciales',
      promedio: 'Sin notas',
      pendientes,
      proximaActividad: proximaActividad
        ? proximaActividad.nombre
        : 'Sin actividades pendientes',
    },
  ]

  function alternarEstadoActividad(id: number) {
    setActividades(
      actividades.map((actividad) =>
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

    setActividades(
      actividades.filter((actividad) => actividad.id !== id),
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
    setNombreActividad('')
    setTipoActividad('Tarea')
    setSemanaActividad('')
    setFechaActividad('')
    setActividadEditandoId(null)
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
      setActividades(
        actividades.map((actividad) =>
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

      setActividades([...actividades, nuevaActividad])
    }

    limpiarFormulario()
  }

  function actualizarNota(
    valor: string,
    guardarNota: (nuevoValor: string) => void,
  ) {
    if (valor === '') {
      guardarNota('')
      return
    }

    const numero = Number(valor)

    if (numero >= 0 && numero <= 20) {
      guardarNota(valor)
    }
  }

  function actualizarNotaConMaximo(
    valor: string,
    maximo: number,
    guardarNota: (nuevoValor: string) => void,
  ) {
    if (valor === '') {
      guardarNota('')
      return
    }
  
    const numero = Number(valor)
  
    if (numero >= 0 && numero <= maximo) {
      guardarNota(valor)
    }
  }

  const pea123 =
  (Number(notaEA1 || 0) +
    Number(notaEA2 || 0) +
    Number(notaEA3 || 0)) /
  3


  const pta12 =
  (Number(notaTA1 || 0) + Number(notaTA2 || 0)) / 2

  const prc12 =
  (Number(notaRC1 || 0) + Number(notaRC2 || 0)) / 2

const p1 = Number(notaP1 || 0)

const ec1SinRedondear =
  pea123 * 0.7 +
  pta12 * 0.1 +
  prc12 * 0.1 +
  p1 * 0.1

  const ec1 = Math.round(ec1SinRedondear)

  const pea456 =
    (Number(notaEA4 || 0) +
      Number(notaEA5 || 0) +
      Number(notaEA6 || 0)) /
    3

    const pta34 =
  (Number(notaTA3 || 0) + Number(notaTA4 || 0)) / 2

  const prc34 =
  (Number(notaRC3 || 0) + Number(notaRC4 || 0)) / 2
  

  const p2 = Number(notaP2 || 0)
  const p3 = Number(notaP3 || 0)
  
  const proyecto2 = p2 + p3
  
  const ec2SinRedondear =
    pea456 * 0.6 +
    pta34 * 0.1 +
    prc34 * 0.1 +
    proyecto2 * 0.2
  
  const ec2 = Math.round(ec2SinRedondear)


  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h2>UniRuta</h2>
          <p>Planificación académica universitaria</p>
        </div>

        <span>Ciclo 2026-1</span>
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
              {cursos.map((curso) => (
                <article className="course-card" key={curso.id}>
                  <div>
                    <h3>{curso.nombre}</h3>
                    <p>Promedio: {curso.promedio}</p>
                    <p>Pendientes: {curso.pendientes}</p>
                    <p>Próxima actividad: {curso.proximaActividad}</p>
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
            <h1>Ecuaciones Diferenciales</h1>
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
                  <strong>—</strong>
                  <span>Promedio actual</span>
                </article>

                <article className="summary-card">
                  <strong>0 %</strong>
                  <span>Ya evaluado</span>
                </article>

                <article className="summary-card">
                  <strong>{pendientes}</strong>
                  <span>Pendientes</span>
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

                <div className="grade-component">
                  <span>Examen parcial</span>
                  <strong>20 %</strong>
                </div>

                <div className="grade-component">
                  <span>Evaluación continua 1</span>
                  <strong>25 %</strong>
                </div>

                <div className="grade-component">
                  <span>Evaluación continua 2</span>
                  <strong>25 %</strong>
                </div>

                <div className="grade-component">
                  <span>Examen final</span>
                  <strong>30 %</strong>
                </div>
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
                  <span>Promedio actual</span>
                  <strong>—</strong>
                </article>

                <article className="final-grade-card">
                  <span>Porcentaje evaluado</span>
                  <strong>0 %</strong>
                </article>

                <article className="final-grade-card">
                  <span>Nota mínima</span>
                  <strong>10.5</strong>
                </article>
              </div>

              <section className="grade-tree">
                <article className="grade-group">
                  <div className="grade-group-title">
                    <div>
                      <h3>Examen parcial</h3>
                      <p>Nota directa sobre 20</p>
                    </div>

                    <strong>20 %</strong>
                  </div>
                </article>

                <article className="grade-group">
                  <div className="grade-group-title">
                    <div>
                      <h3>Evaluación continua 1</h3>
                      <p>
                        Se redondea antes de calcular la nota final
                      </p>
                    </div>

                    <strong>25 %</strong>
                  </div>

                  <div className="subcomponents-list">
                    <div>
                      <span>PEA123</span>
                      <strong>70 %</strong>
                    </div>

                    <div>
                      <span>PTA12</span>
                      <strong>10 %</strong>
                    </div>

                    <div>
                      <span>PRC12</span>
                      <strong>10 %</strong>
                    </div>

                    <div>
                      <span>P1</span>
                      <strong>10 %</strong>
                    </div>
                  </div>

                  <div className="grade-input-section">
                    <h4>Evaluaciones en aula</h4>

                    <div className="grade-input-grid">
                      <label className="grade-input-field">
                        <span>EA1</span>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={notaEA1}
                          onChange={(event) =>
                            actualizarNota(
                              event.target.value,
                              setNotaEA1,
                            )
                          }
                          placeholder="0 a 20"
                        />
                      </label>

                      <label className="grade-input-field">
                        <span>EA2</span>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={notaEA2}
                          onChange={(event) =>
                            actualizarNota(
                              event.target.value,
                              setNotaEA2,
                            )
                          }
                          placeholder="0 a 20"
                        />
                      </label>

                      <label className="grade-input-field">
                        <span>EA3</span>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={notaEA3}
                          onChange={(event) =>
                            actualizarNota(
                              event.target.value,
                              setNotaEA3,
                            )
                          }
                          placeholder="0 a 20"
                        />
                      </label>
                    </div>

                    <div className="calculated-grade">
                    <span>Promedio provisional PEA123</span>

                      <strong>{pea123.toFixed(2)}</strong>
                    </div>

                    <div className="grade-input-section">
  <h4>Tareas</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>TA1</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaTA1}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaTA1)
        }
        placeholder="0 a 20"
      />
    </label>

    <label className="grade-input-field">
      <span>TA2</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaTA2}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaTA2)
        }
        placeholder="0 a 20"
      />
    </label>
  </div>

  <div className="calculated-grade">
  <span>Promedio provisional PTA12</span>

    <strong>{pta12.toFixed(2)}</strong>
  </div>
</div>

<div className="grade-input-section">
  <h4>Resolución de casos</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>RC1</span>
      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaRC1}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaRC1)
        }
        placeholder="0 a 20"
      />
    </label>

    <label className="grade-input-field">
      <span>RC2</span>
      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaRC2}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaRC2)
        }
        placeholder="0 a 20"
      />
    </label>
  </div>

  <div className="calculated-grade">
    <span>Promedio provisional PRC12</span>
    <strong>{prc12.toFixed(2)}</strong>
  </div>
</div>

<div className="grade-input-section">
  <h4>Proyecto ABP</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>P1</span>
      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaP1}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaP1)
        }
        placeholder="0 a 20"
      />
    </label>
  </div>

  <div className="calculated-grade">
    <span>EC1 antes del redondeo</span>
    <strong>{ec1SinRedondear.toFixed(2)}</strong>
  </div>

  <div className="calculated-grade">
    <span>EC1 redondeada</span>
    <strong>{ec1}</strong>
  </div>
</div>


                  </div>
                </article>

                <article className="grade-group">
  <div className="grade-group-title">
    <div>
      <h3>Evaluación continua 2</h3>
      <p>Se redondea antes de calcular la nota final</p>
    </div>

    <strong>25 %</strong>
  </div>

  <div className="subcomponents-list">
    <div>
      <span>PEA456</span>
      <strong>60 %</strong>
    </div>

    <div>
      <span>PTA34</span>
      <strong>10 %</strong>
    </div>

    <div>
      <span>PRC34</span>
      <strong>10 %</strong>
    </div>

    <div>
      <span>P2 + P3</span>
      <strong>20 %</strong>
    </div>
  </div>

  <div className="grade-input-section">
    <h4>Evaluaciones en aula</h4>

    <div className="grade-input-grid">
      <label className="grade-input-field">
        <span>EA4</span>

        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          value={notaEA4}
          onChange={(event) =>
            actualizarNota(event.target.value, setNotaEA4)
          }
          placeholder="0 a 20"
        />
      </label>

      <label className="grade-input-field">
        <span>EA5</span>

        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          value={notaEA5}
          onChange={(event) =>
            actualizarNota(event.target.value, setNotaEA5)
          }
          placeholder="0 a 20"
        />
      </label>

      <label className="grade-input-field">
        <span>EA6</span>

        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          value={notaEA6}
          onChange={(event) =>
            actualizarNota(event.target.value, setNotaEA6)
          }
          placeholder="0 a 20"
        />
      </label>
    </div>

    <div className="calculated-grade">
      <span>Promedio provisional PEA456</span>
      <strong>{pea456.toFixed(2)}</strong>
    </div>
  </div>
</article>

<div className="grade-input-section">
  <h4>Tareas</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>TA3</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaTA3}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaTA3)
        }
        placeholder="0 a 20"
      />
    </label>

    <label className="grade-input-field">
      <span>TA4</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaTA4}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaTA4)
        }
        placeholder="0 a 20"
      />
    </label>
  </div>

  <div className="calculated-grade">
    <span>Promedio provisional PTA34</span>
    <strong>{pta34.toFixed(2)}</strong>
  </div>
</div>

<div className="grade-input-section">
  <h4>Resolución de casos</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>RC3</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaRC3}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaRC3)
        }
        placeholder="0 a 20"
      />
    </label>

    <label className="grade-input-field">
      <span>RC4</span>

      <input
        type="number"
        min="0"
        max="20"
        step="0.01"
        value={notaRC4}
        onChange={(event) =>
          actualizarNota(event.target.value, setNotaRC4)
        }
        placeholder="0 a 20"
      />
    </label>
  </div>

  <div className="calculated-grade">
    <span>Promedio provisional PRC34</span>
    <strong>{prc34.toFixed(2)}</strong>
  </div>
</div>


<div className="grade-input-section">
  <h4>Proyecto ABP</h4>

  <div className="grade-input-grid">
    <label className="grade-input-field">
      <span>P2 — máximo 5</span>

      <input
        type="number"
        min="0"
        max="5"
        step="0.01"
        value={notaP2}
        onChange={(event) =>
          actualizarNotaConMaximo(
            event.target.value,
            5,
            setNotaP2,
          )
        }
        placeholder="0 a 5"
      />
    </label>

    <label className="grade-input-field">
      <span>P3 — máximo 15</span>

      <input
        type="number"
        min="0"
        max="15"
        step="0.01"
        value={notaP3}
        onChange={(event) =>
          actualizarNotaConMaximo(
            event.target.value,
            15,
            setNotaP3,
          )
        }
        placeholder="0 a 15"
      />
    </label>
  </div>

  <div className="calculated-grade">
    <span>P2 + P3</span>
    <strong>{proyecto2.toFixed(2)} / 20</strong>
  </div>

  <div className="calculated-grade">
    <span>EC2 antes del redondeo</span>
    <strong>{ec2SinRedondear.toFixed(2)}</strong>
  </div>

  <div className="calculated-grade">
    <span>EC2 redondeada</span>
    <strong>{ec2}</strong>
  </div>
</div>

                <article className="grade-group">
                  <div className="grade-group-title">
                    <div>
                      <h3>Examen final</h3>
                      <p>Nota directa sobre 20</p>
                    </div>

                    <strong>30 %</strong>
                  </div>
                </article>
              </section>
            </section>
          )}
        </section>
      )}
    </main>
  )
} 

export default App