export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export type EstadoSesionEstudio =
  | "Pendiente"
  | "Completada";

export type PrioridadSesion =
  | "Alta"
  | "Media"
  | "Baja";

export type SesionEstudio = {
  id: string;
  dia: DiaSemana;
  duracionMinutos: number;
  titulo: string;
  detalle: string;
  origen: "Actividad" | "Temario";
  prioridad: PrioridadSesion;
  motivoPrioridad: string;
  estado: EstadoSesionEstudio;
};

export type ConfiguracionPlanEstudio = {
  semanaActual: number;
  horasSemanales: number;
  duracionSesion: number;
  diasDisponibles: DiaSemana[];
};

export type PlanEstudioGuardado = {
  configuracion: ConfiguracionPlanEstudio;
  sesiones: SesionEstudio[];
};