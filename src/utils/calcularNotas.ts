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