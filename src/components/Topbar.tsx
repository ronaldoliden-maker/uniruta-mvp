type TopbarProps = {
    ciclo: string;
  };
  
  function Topbar({ ciclo }: TopbarProps) {
    return (
      <header className="topbar">
        <div>
          <h2>UniRuta</h2>
          <p>Planificación académica universitaria</p>
        </div>
  
        <span>Ciclo {ciclo}</span>
      </header>
    );
  }
  
  export default Topbar;