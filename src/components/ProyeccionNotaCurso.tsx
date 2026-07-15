type ProyeccionNotaCursoProps = {
    metaNota: string;
    notaMaxima: number;
    puntosAcumulados: number;
    porcentajePendiente: number;
    promedioNecesario: number | null;
    onCambiarMeta: (valor: string) => void;
  };
  
  function ProyeccionNotaCurso({
    metaNota,
    notaMaxima,
    puntosAcumulados,
    porcentajePendiente,
    promedioNecesario,
    onCambiarMeta,
  }: ProyeccionNotaCursoProps) {
    return (
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
              max={notaMaxima}
              step="0.1"
              value={metaNota}
              onChange={(event) =>
                onCambiarMeta(event.target.value)
              }
            />
          </label>
        </div>
  
        <div className="goal-results">
          <article>
            <span>Puntos acumulados oficiales</span>
  
            <strong>
              {puntosAcumulados.toFixed(2)}
            </strong>
          </article>
  
          <article>
            <span>Porcentaje pendiente</span>
  
            <strong>
              {porcentajePendiente.toFixed(2)} %
            </strong>
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
          ) : promedioNecesario > notaMaxima ? (
            <strong>
              La meta no es alcanzable con las evaluaciones restantes.
            </strong>
          ) : (
            <>
              <span>
                Promedio aproximado necesario en lo pendiente
              </span>
  
              <strong>
                {promedioNecesario.toFixed(2)}
              </strong>
            </>
          )}
        </div>
  
        <small>
          Es una estimación. Los redondeos internos del sistema de
          evaluación pueden modificar ligeramente el resultado final.
        </small>
      </section>
    );
  }
  
  export default ProyeccionNotaCurso;