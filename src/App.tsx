import { useState } from 'react'
import './App.css'

function App() {
  const [vista, setVista] = useState('inicio')

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

                  <button type="button" onClick={() => setVista('curso')}>
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
            <button type="button" className="active-tab">
              Resumen
            </button>
            <button type="button">Actividades</button>
            <button type="button">Notas</button>
            <button type="button">Calendario</button>
          </nav>

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
              <strong>5</strong>
              <span>Pendientes</span>
            </article>
          </div>

          <article className="next-activity">
            <p>Próxima actividad</p>
            <h2>EA1 — Evaluación en aula</h2>
            <span>Semana 2 · Fecha exacta pendiente</span>
          </article>

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
        </section>
      )}
    </main>
  )
}

export default App