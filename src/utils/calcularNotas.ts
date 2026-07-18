import type {
  ComponenteNota,
  ReglaRedondeo,
} from '../types/academico'
  
  export type NotasPorId = Record<
    string,
    number | string | undefined
  >
  
  export type EvaluacionDirecta = {
    id: string
    nombre: string
    notaMaxima: number
  }
  
  function convertirANumero(
    valor: number | string | undefined,
  ) {
    if (valor === undefined || valor === '') {
      return 0
    }
  
    const numero = Number(valor)
  
    return Number.isFinite(numero) ? numero : 0
  }
  
  function limitar(
    valor: number,
    minimo: number,
    maximo: number,
  ) {
    return Math.min(
      Math.max(valor, minimo),
      maximo,
    )
  }
  
  function aplicarRedondeo(
    valor: number,
    regla: ReglaRedondeo | undefined,
  ) {
    if (regla === 'entero') {
      return Math.round(valor)
    }
  
    return valor
  }
  
  export function calcularComponente(
    componente: ComponenteNota,
    notas: NotasPorId,
  ): number {
    const notaMaxima = componente.notaMaxima ?? 20
    const hijos = componente.hijos ?? []
  
    if (componente.tipo === 'nota_directa') {
      const notaIngresada = convertirANumero(
        notas[componente.id],
      )
  
      const notaLimitada = limitar(
        notaIngresada,
        0,
        notaMaxima,
      )
  
      return aplicarRedondeo(
        notaLimitada,
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'promedio') {
      if (hijos.length === 0) {
        return 0
      }
  
      const sumaNormalizada = hijos.reduce(
        (suma, hijo) => {
          const valorHijo = calcularComponente(
            hijo,
            notas,
          )
  
          const maximoHijo =
            hijo.notaMaxima ?? notaMaxima
  
          if (maximoHijo === 0) {
            return suma
          }
  
          const valorNormalizado =
            (valorHijo / maximoHijo) *
            notaMaxima
  
          return suma + valorNormalizado
        },
        0,
      )
  
      const promedio =
        sumaNormalizada / hijos.length
  
      const promedioLimitado = limitar(
        promedio,
        0,
        notaMaxima,
      )
  
      return aplicarRedondeo(
        promedioLimitado,
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'suma') {
      const suma = hijos.reduce(
        (total, hijo) => {
          return (
            total +
            calcularComponente(hijo, notas)
          )
        },
        0,
      )
  
      const sumaLimitada = limitar(
        suma,
        0,
        notaMaxima,
      )
  
      return aplicarRedondeo(
        sumaLimitada,
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'ponderado') {
      const resultado = hijos.reduce(
        (total, hijo) => {
          const valorHijo = calcularComponente(
            hijo,
            notas,
          )
  
          const maximoHijo =
            hijo.notaMaxima ?? notaMaxima
  
          const pesoHijo = hijo.peso ?? 0
  
          if (maximoHijo === 0) {
            return total
          }
  
          const valorNormalizado =
            (valorHijo / maximoHijo) *
            notaMaxima
  
          const aporte =
            valorNormalizado *
            (pesoHijo / 100)
  
          return total + aporte
        },
        0,
      )
  
      const resultadoLimitado = limitar(
        resultado,
        0,
        notaMaxima,
      )
  
      return aplicarRedondeo(
        resultadoLimitado,
        componente.redondeo,
      )
    }
  
    return 0
  }
  
  export function calcularNotaFinal(
    componentes: ComponenteNota[],
    notas: NotasPorId,
    notaMaximaFinal = 20,
  ) {
    const resultado = componentes.reduce(
      (total, componente) => {
        const peso = componente.peso ?? 0
  
        const valor = calcularComponente(
          componente,
          notas,
        )
  
        const maximoComponente =
          componente.notaMaxima ??
          notaMaximaFinal
  
        if (maximoComponente === 0) {
          return total
        }
  
        const valorNormalizado =
          (valor / maximoComponente) *
          notaMaximaFinal
  
        const aporte =
          valorNormalizado *
          (peso / 100)
  
        return total + aporte
      },
      0,
    )
  
    return limitar(
      resultado,
      0,
      notaMaximaFinal,
    )
  }
  
  export function obtenerEvaluacionesDirectas(
    componentes: ComponenteNota[],
  ): EvaluacionDirecta[] {
    return componentes.flatMap(
      (componente) => {
        if (
          componente.tipo ===
          'nota_directa'
        ) {
          return [
            {
              id: componente.id,
              nombre: componente.nombre,
              notaMaxima:
                componente.notaMaxima ?? 20,
            },
          ]
        }
  
        return obtenerEvaluacionesDirectas(
          componente.hijos ?? [],
        )
      },
    )
  }

  // Calcula el peso real de cada evaluación directa
// dentro de la nota final del curso.
export function obtenerPesosEvaluacionesDirectas(
  componentes: ComponenteNota[],
): Record<string, number> {
  const pesos: Record<string, number> = {}

  function recorrerComponente(
    componente: ComponenteNota,
    pesoAcumulado: number,
  ) {
    const hijos = componente.hijos ?? []

    // Una nota directa recibe el peso acumulado hasta este nivel.
    if (componente.tipo === 'nota_directa') {
      pesos[componente.id] = pesoAcumulado
      return
    }

    if (hijos.length === 0) {
      return
    }

    // En un componente ponderado, cada hijo tiene
    // un porcentaje definido.
    if (componente.tipo === 'ponderado') {
      hijos.forEach((hijo) => {
        const pesoHijo = hijo.peso ?? 0

        recorrerComponente(
          hijo,
          pesoAcumulado * (pesoHijo / 100),
        )
      })

      return
    }

    // En un promedio, todos los hijos tienen el mismo peso.
    if (componente.tipo === 'promedio') {
      const pesoPorHijo =
        pesoAcumulado / hijos.length

      hijos.forEach((hijo) => {
        recorrerComponente(
          hijo,
          pesoPorHijo,
        )
      })

      return
    }

    // En una suma, el peso se distribuye según
    // la nota máxima de cada hijo.
    if (componente.tipo === 'suma') {
      const notaMaximaPadre =
        componente.notaMaxima ??
        hijos.reduce(
          (total, hijo) =>
            total + (hijo.notaMaxima ?? 20),
          0,
        )

      if (notaMaximaPadre === 0) {
        return
      }

      hijos.forEach((hijo) => {
        const notaMaximaHijo =
          hijo.notaMaxima ?? 20

        recorrerComponente(
          hijo,
          pesoAcumulado *
            (notaMaximaHijo / notaMaximaPadre),
        )
      })
    }
  }

  componentes.forEach((componente) => {
    recorrerComponente(
      componente,
      componente.peso ?? 0,
    )
  })

  return pesos
}