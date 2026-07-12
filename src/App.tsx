import { useState } from 'react'
import './App.css'

function App() {
  const [mostrarPanel, setMostrarPanel] = useState(false)

  const cursos = [
    {
      id: 1,
      nombre: 'Ecuaciones Diferenciales',
      promedio: 'Sin notas',
      pendientes: 5,
      proximaActividad: 'EA1',
    },
  ]

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h2>UniRuta</h2>
          <p>Planificación académica universitaria</p>
        </div>

        <span>Ciclo 2026-1</span>
      </header>

      {!mostrarPanel ? (
        <section className="welcome">
          <p>Panel principal</p>

          <h1>Organiza tu ciclo universitario</h1>

          <p>
            Controla tus cursos, actividades, calendario y notas desde un solo
            lugar.
          </p>

          <button type="button" onClick={() => setMostrarPanel(true)}>
            Comenzar
          </button>
        </section>
      ) : (
        <section className="welcome">
          <p>Semana actual</p>

          <h1>Semana 1 de 16</h1>

          <p>
            Aquí aparecerá el resumen de tus actividades, cursos y evaluaciones.
          </p>

          <div className="summary-grid">
            <article className="summary-card">
              <strong>0</strong>
              <span>Pendientes</span>
            </article>

            <article className="summary-card">
              <strong>0</strong>
              <span>Atrasadas</span>
            </article>

            <article className="summary-card">
              <strong>0</strong>
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

                  <button type="button">Abrir curso</button>
                </article>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setMostrarPanel(false)}
          >
            Volver
          </button>
        </section>
      )}
    </main>
  )
}

export default App