import './App.css'

function App() {
  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h2>UniRuta</h2>
          <p>Planificación académica universitaria</p>
        </div>

        <span>Ciclo 2026-1</span>
      </header>

      <section className="welcome">
        <p>Panel principal</p>

        <h1>Organiza tu ciclo universitario</h1>

        <p>
          Controla tus cursos, actividades, calendario y notas desde un solo
          lugar.
        </p>

        <button type="button">Comenzar</button>
      </section>
    </main>
  )
}

export default App