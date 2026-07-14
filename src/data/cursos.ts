import type { Curso } from '../types/academico'
import { configuracionEDO } from './edoConfig'

// Lista inicial de cursos disponibles en UniRuta
export const cursosIniciales: Curso[] = [
  {
    ...configuracionEDO,
    codigo: 'EDO',
    estado: 'en_curso',
  },
]