import type { TemaCurso } from "../types/tema";

function obtenerClaveTemario(cursoId: string) {
  return `uniruta-curso-${cursoId}-temario`;
}

export function cargarTemarioCurso(cursoId: string): TemaCurso[] {
  const contenido = localStorage.getItem(obtenerClaveTemario(cursoId));

  if (!contenido) {
    return [];
  }

  try {
    const temario = JSON.parse(contenido) as TemaCurso[];

    return Array.isArray(temario) ? temario : [];
  } catch {
    localStorage.removeItem(obtenerClaveTemario(cursoId));
    return [];
  }
}

export function guardarTemarioCurso(
  cursoId: string,
  temario: TemaCurso[],
) {
  localStorage.setItem(
    obtenerClaveTemario(cursoId),
    JSON.stringify(temario),
  );
}