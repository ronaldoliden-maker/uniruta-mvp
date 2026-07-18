import type { Curso } from '../types/academico'

import { configuracionEDO } from './edoConfig'
import {
  configuracionCursoPrueba,
} from './cursoPruebaConfig'

// Registro general de cursos disponibles en UniRuta
export const cursosIniciales: Curso[] = [
  {
    ...configuracionEDO,
    codigo: 'EDO',
    estado: 'en_curso',
  },

  {
    ...configuracionCursoPrueba,
    codigo: 'PRB',
    estado: 'en_curso',
  },
]