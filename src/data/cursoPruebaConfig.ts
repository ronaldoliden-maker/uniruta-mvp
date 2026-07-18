import type {
    ConfiguracionCurso,
  } from '../types/academico'
  
  // Configuración temporal para comprobar que UniRuta
  // puede abrir cursos con sistemas de evaluación diferentes.
  export const configuracionCursoPrueba: ConfiguracionCurso = {
    id: 'curso-prueba-2026-1',
    nombre: 'Curso de prueba',
    ciclo: '2026-1',
    notaMinima: 10.5,
    notaMaxima: 20,
  
    componentes: [
      {
        id: 'parcial',
        nombre: 'Examen parcial',
        tipo: 'nota_directa',
        peso: 30,
        notaMaxima: 20,
        redondeo: 'ninguno',
      },
  
      {
        id: 'proyecto',
        nombre: 'Proyecto',
        tipo: 'nota_directa',
        peso: 30,
        notaMaxima: 20,
        redondeo: 'ninguno',
      },
  
      {
        id: 'final',
        nombre: 'Examen final',
        tipo: 'nota_directa',
        peso: 40,
        notaMaxima: 20,
        redondeo: 'ninguno',
      },
    ],
  }