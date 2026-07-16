import type {
    DiaSemana,
    SesionEstudio,
  } from "../types/planEstudio";
  
  const INDICE_DIA: Record<DiaSemana, number> = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };
  
  const DIA_POR_INDICE: DiaSemana[] = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  
  function agregarCeros(valor: number) {
    return String(valor).padStart(2, "0");
  }
  
  export function fechaLocalDesdeISO(
    fechaISO: string,
  ) {
    const partes = fechaISO
      .split("-")
      .map(Number);
  
    if (
      partes.length !== 3 ||
      partes.some((parte) =>
        !Number.isFinite(parte),
      )
    ) {
      return new Date();
    }
  
    const [anio, mes, dia] = partes;
  
    return new Date(anio, mes - 1, dia);
  }
  
  export function fechaISODesdeDate(
    fecha: Date,
  ) {
    return `${fecha.getFullYear()}-${agregarCeros(
      fecha.getMonth() + 1,
    )}-${agregarCeros(fecha.getDate())}`;
  }
  
  export function obtenerFechaHoy() {
    return fechaISODesdeDate(new Date());
  }
  
  export function obtenerDiaDeFecha(
    fechaISO: string,
  ): DiaSemana {
    const fecha = fechaLocalDesdeISO(fechaISO);
  
    return DIA_POR_INDICE[fecha.getDay()];
  }
  
  export function formatearFechaLarga(
    fechaISO: string,
  ) {
    const fecha = fechaLocalDesdeISO(fechaISO);
  
    return new Intl.DateTimeFormat("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(fecha);
  }
  
  export function esSesionAtrasada(
    sesion: SesionEstudio,
  ) {
    return (
      sesion.estado === "Pendiente" &&
      sesion.fecha < obtenerFechaHoy()
    );
  }
  
  export function obtenerProximaFechaParaDia(
    dia: DiaSemana,
    fechaInicio = obtenerFechaHoy(),
  ) {
    const fecha = fechaLocalDesdeISO(
      fechaInicio,
    );
  
    const objetivo = INDICE_DIA[dia];
    const diferencia =
      (objetivo - fecha.getDay() + 7) % 7;
  
    fecha.setDate(
      fecha.getDate() + diferencia,
    );
  
    return fechaISODesdeDate(fecha);
  }
  
  export function obtenerFechasParaSesiones(
    fechaInicio: string,
    diasDisponibles: DiaSemana[],
    cantidad: number,
    maximoPorDia = 1,
  ) {
    if (
      cantidad <= 0 ||
      diasDisponibles.length === 0
    ) {
      return [];
    }
  
    const diasPermitidos = new Set(
      diasDisponibles.map(
        (dia) => INDICE_DIA[dia],
      ),
    );
  
    const fechas: string[] = [];
    const fecha = fechaLocalDesdeISO(
      fechaInicio || obtenerFechaHoy(),
    );
  
    let seguridad = 0;
  
    while (
      fechas.length < cantidad &&
      seguridad < 730
    ) {
      if (
        diasPermitidos.has(fecha.getDay())
      ) {
        const fechaISO =
          fechaISODesdeDate(fecha);
  
        const espacios = Math.min(
          maximoPorDia,
          cantidad - fechas.length,
        );
  
        for (
          let indice = 0;
          indice < espacios;
          indice += 1
        ) {
          fechas.push(fechaISO);
        }
      }
  
      fecha.setDate(fecha.getDate() + 1);
      seguridad += 1;
    }
  
    return fechas;
  }
  
  export function reprogramarSesionesAtrasadas(
    sesiones: SesionEstudio[],
    diasDisponibles: DiaSemana[],
  ) {
    const atrasadas = sesiones
      .filter(esSesionAtrasada)
      .sort((sesionA, sesionB) =>
        sesionA.fecha.localeCompare(
          sesionB.fecha,
        ),
      );
  
    if (
      atrasadas.length === 0 ||
      diasDisponibles.length === 0
    ) {
      return {
        sesiones,
        cantidadReprogramada: 0,
      };
    }
  
    const hoy = obtenerFechaHoy();
  
    const ocupacion = new Map<
      string,
      number
    >();
  
    sesiones.forEach((sesion) => {
      if (
        sesion.estado === "Pendiente" &&
        sesion.fecha >= hoy &&
        !atrasadas.some(
          (atrasada) =>
            atrasada.id === sesion.id,
        )
      ) {
        ocupacion.set(
          sesion.fecha,
          (ocupacion.get(sesion.fecha) ?? 0) +
            1,
        );
      }
    });
  
    const diasPermitidos = new Set(
      diasDisponibles.map(
        (dia) => INDICE_DIA[dia],
      ),
    );
  
    const nuevasFechas: string[] = [];
    const fecha = fechaLocalDesdeISO(hoy);
  
    let seguridad = 0;
  
    while (
      nuevasFechas.length <
        atrasadas.length &&
      seguridad < 730
    ) {
      if (
        diasPermitidos.has(fecha.getDay())
      ) {
        const fechaISO =
          fechaISODesdeDate(fecha);
  
        const cantidadOcupada =
          ocupacion.get(fechaISO) ?? 0;
  
        const espaciosDisponibles =
          Math.max(
            0,
            2 - cantidadOcupada,
          );
  
        for (
          let indice = 0;
          indice <
            espaciosDisponibles &&
          nuevasFechas.length <
            atrasadas.length;
          indice += 1
        ) {
          nuevasFechas.push(fechaISO);
  
          ocupacion.set(
            fechaISO,
            (ocupacion.get(fechaISO) ?? 0) +
              1,
          );
        }
      }
  
      fecha.setDate(fecha.getDate() + 1);
      seguridad += 1;
    }
  
    const fechaPorSesion = new Map(
      atrasadas.map((sesion, indice) => [
        sesion.id,
        nuevasFechas[indice],
      ]),
    );
  
    const sesionesActualizadas =
      sesiones.map((sesion) => {
        const nuevaFecha =
          fechaPorSesion.get(sesion.id);
  
        if (!nuevaFecha) {
          return sesion;
        }
  
        return {
          ...sesion,
          fechaOriginal:
            sesion.fechaOriginal ??
            sesion.fecha,
          fecha: nuevaFecha,
          dia: obtenerDiaDeFecha(
            nuevaFecha,
          ),
          reprogramada: true,
        };
      });
  
    return {
      sesiones: sesionesActualizadas,
      cantidadReprogramada:
        atrasadas.length,
    };
  }