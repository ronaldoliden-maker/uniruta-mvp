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
  fecha: string;
  dia: DiaSemana;
  duracionMinutos: number;
  titulo: string;
  detalle: string;
  origen: "Actividad" | "Temario";
  prioridad: PrioridadSesion;
  motivoPrioridad: string;
  estado: EstadoSesionEstudio;
  reprogramada?: boolean;
  fechaOriginal?: string;
};

export type ConfiguracionPlanEstudio = {
  semanaActual: number;
  fechaInicio: string;
  horasSemanales: number;
  duracionSesion: number;
  diasDisponibles: DiaSemana[];
};

export type PlanEstudioGuardado = {
  configuracion: ConfiguracionPlanEstudio;
  sesiones: SesionEstudio[];
};