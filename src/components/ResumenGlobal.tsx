type ResumenGlobalProps = {
    pendientes: number;
    atrasadas: number;
    completadas: number;
  };
  
  function ResumenGlobal({
    pendientes,
    atrasadas,
    completadas,
  }: ResumenGlobalProps) {
    return (
      <div className="summary-grid">
        <article className="summary-card">
          <strong>{pendientes}</strong>
          <span>Pendientes</span>
        </article>
  
        <article className="summary-card">
          <strong>{atrasadas}</strong>
          <span>Atrasadas</span>
        </article>
  
        <article className="summary-card">
          <strong>{completadas}</strong>
          <span>Completadas</span>
        </article>
      </div>
    );
  }
  
  export default ResumenGlobal;