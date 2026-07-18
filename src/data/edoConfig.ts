import type {
  ConfiguracionCurso,
} from '../types/academico'

export const configuracionEDO: ConfiguracionCurso = {
id: 'edo-2026-1',
  nombre: 'Ecuaciones Diferenciales',
  ciclo: '2026-1',
  notaMinima: 10.5,
  notaMaxima: 20,

  componentes: [
    {
      id: 'ep',
      nombre: 'Examen parcial',
      tipo: 'nota_directa',
      peso: 20,
      notaMaxima: 20,
      redondeo: 'ninguno',
    },

    {
      id: 'ec1',
      nombre: 'Evaluación continua 1',
      tipo: 'ponderado',
      peso: 25,
      notaMaxima: 20,
      redondeo: 'entero',

      hijos: [
        {
          id: 'pea123',
          nombre: 'PEA123',
          tipo: 'promedio',
          peso: 70,
          notaMaxima: 20,

          hijos: [
            {
              id: 'ea1',
              nombre: 'EA1',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ea2',
              nombre: 'EA2',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ea3',
              nombre: 'EA3',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'pta12',
          nombre: 'PTA12',
          tipo: 'promedio',
          peso: 10,
          notaMaxima: 20,

          hijos: [
            {
              id: 'ta1',
              nombre: 'TA1',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ta2',
              nombre: 'TA2',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'prc12',
          nombre: 'PRC12',
          tipo: 'promedio',
          peso: 10,
          notaMaxima: 20,

          hijos: [
            {
              id: 'rc1',
              nombre: 'RC1',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'rc2',
              nombre: 'RC2',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'p1',
          nombre: 'P1',
          tipo: 'nota_directa',
          peso: 10,
          notaMaxima: 20,
        },
      ],
    },

    {
      id: 'ec2',
      nombre: 'Evaluación continua 2',
      tipo: 'ponderado',
      peso: 25,
      notaMaxima: 20,
      redondeo: 'entero',

      hijos: [
        {
          id: 'pea456',
          nombre: 'PEA456',
          tipo: 'promedio',
          peso: 60,
          notaMaxima: 20,

          hijos: [
            {
              id: 'ea4',
              nombre: 'EA4',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ea5',
              nombre: 'EA5',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ea6',
              nombre: 'EA6',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'pta34',
          nombre: 'PTA34',
          tipo: 'promedio',
          peso: 10,
          notaMaxima: 20,

          hijos: [
            {
              id: 'ta3',
              nombre: 'TA3',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'ta4',
              nombre: 'TA4',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'prc34',
          nombre: 'PRC34',
          tipo: 'promedio',
          peso: 10,
          notaMaxima: 20,

          hijos: [
            {
              id: 'rc3',
              nombre: 'RC3',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
            {
              id: 'rc4',
              nombre: 'RC4',
              tipo: 'nota_directa',
              notaMaxima: 20,
            },
          ],
        },

        {
          id: 'proyecto2',
          nombre: 'P2 + P3',
          tipo: 'suma',
          peso: 20,
          notaMaxima: 20,

          hijos: [
            {
              id: 'p2',
              nombre: 'P2',
              tipo: 'nota_directa',
              notaMaxima: 5,
            },
            {
              id: 'p3',
              nombre: 'P3',
              tipo: 'nota_directa',
              notaMaxima: 15,
            },
          ],
        },
      ],
    },

    {
      id: 'ef',
      nombre: 'Examen final',
      tipo: 'nota_directa',
      peso: 30,
      notaMaxima: 20,
      redondeo: 'ninguno',
    },
  ],
}