import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

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


  const [actividades, setActividades] = useState(() => {
    const actividadesGuardadas = localStorage.getItem('uniruta-actividades')

    if (actividadesGuardadas) {
      return JSON.parse(actividadesGuardadas)
    }

    return [
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
})

useEffect(() => {
  localStorage.setItem(
    'uniruta-actividades',
    JSON.stringify(actividades),
  )
}, [actividades])

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
      estado: 'No iniciada',
    }
  
    if (actividadEditandoId !== null) {
      setActividades(
        actividades.map((actividad) =>
          actividad.id === actividadEditandoId
            ? {
                ...actividad,
                ...datosActividad,
                estado: actividad.estado,
              }
            : actividad,
        ),
      )
    } else {
      const nuevaActividad = {
        id: Date.now(),
        ...datosActividad,
      }
  
      setActividades([...actividades, nuevaActividad])
    }
  
    limpiarFormulario()
  }

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

            <button type="button" disabled>
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
    <span>Has completado todas las actividades registradas.</span>
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
                {mostrarFormulario && (
                <form className="activity-form" onSubmit={agregarActividad}>
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
                  <p>Organización del curso</p>
                  <h2>Actividades</h2>
                </div>

                <button type="button" onClick={abrirFormularioNuevo}>
  + Agregar actividad
</button>
              </div>

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
      actividad.estado === 'Completada' ? 'completed-status' : ''
    }`}
  >
    {actividad.estado}
  </span>

  <button
    type="button"
    className="activity-status-button"
    onClick={() => alternarEstadoActividad(actividad.id)}
  >
    {actividad.estado === 'Completada' ? 'Reabrir' : 'Completar'}
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
        </section>
      )}
    </main>
  )
}

export default App