export type EvaluacionPropuesta = {
    id: string;
    nombre: string;
    peso: string;
    semana: string;
  };
  
  export type TemaPropuesto = {
    id: string;
    titulo: string;
    semana: string;
  };
  
  export type PropuestaSilabo = {
    codigoCurso: string;
    nombreCurso: string;
    notaMinima: string;
    formula: string;
    evaluaciones: EvaluacionPropuesta[];
    temas: TemaPropuesto[];
    advertencias: string[];
  };