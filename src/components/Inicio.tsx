type InicioProps = {
    onComenzar: () => void;
  };
  
  function Inicio({ onComenzar }: InicioProps) {
    return (
      <section className="welcome">
        <p>Panel principal</p>
  
        <h1>Organiza tu ciclo universitario</h1>
  
        <p>
          Controla tus cursos, actividades, calendario y notas desde un solo
          lugar.
        </p>
  
        <button type="button" onClick={onComenzar}>
          Comenzar
        </button>
      </section>
    );
  }
  
  export default Inicio;