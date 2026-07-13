import type {
    ComponenteNota,
    ReglaRedondeo,
  } from '../data/edoConfig'
  
  export type NotasPorId = Record<
    string,
    number | string | undefined
  >
  
  function convertirANumero(valor: number | string | undefined) {
    if (valor === undefined || valor === '') {
      return 0
    }
  
    const numero = Number(valor)
  
    return Number.isFinite(numero) ? numero : 0
  }
  
  function limitar(valor: number, minimo: number, maximo: number) {
    return Math.min(Math.max(valor, minimo), maximo)
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
      const notaIngresada = convertirANumero(notas[componente.id])
      const notaLimitada = limitar(notaIngresada, 0, notaMaxima)
  
      return aplicarRedondeo(
        notaLimitada,
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'promedio') {
      if (hijos.length === 0) {
        return 0
      }
  
      const sumaNormalizada = hijos.reduce((suma, hijo) => {
        const valorHijo = calcularComponente(hijo, notas)
        const maximoHijo = hijo.notaMaxima ?? notaMaxima
  
        if (maximoHijo === 0) {
          return suma
        }
  
        const valorNormalizado =
          (valorHijo / maximoHijo) * notaMaxima
  
        return suma + valorNormalizado
      }, 0)
  
      const promedio = sumaNormalizada / hijos.length
  
      return aplicarRedondeo(
        limitar(promedio, 0, notaMaxima),
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'suma') {
      const suma = hijos.reduce(
        (total, hijo) =>
          total + calcularComponente(hijo, notas),
        0,
      )
  
      return aplicarRedondeo(
        limitar(suma, 0, notaMaxima),
        componente.redondeo,
      )
    }
  
    if (componente.tipo === 'ponderado') {
      const resultado = hijos.reduce((total, hijo) => {
        const valorHijo = calcularComponente(hijo, notas)
        const maximoHijo = hijo.notaMaxima ?? notaMaxima
        const pesoHijo = hijo.peso ?? 0
  
        if (maximoHijo === 0) {
          return total
        }
  
        const valorNormalizado =
          (valorHijo / maximoHijo) * notaMaxima
  
        return total + valorNormalizado * (pesoHijo / 100)
      }, 0)
  
      return aplicarRedondeo(
        limitar(resultado, 0, notaMaxima),
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
    const resultado = componentes.reduce((total, componente) => {
      const peso = componente.peso ?? 0
      const valor = calcularComponente(componente, notas)
      const maximoComponente =
        componente.notaMaxima ?? notaMaximaFinal
  
      if (maximoComponente === 0) {
        return total
      }
  
      const valorNormalizado =
        (valor / maximoComponente) * notaMaximaFinal
  
      return total + valorNormalizado * (peso / 100)
    }, 0)
  
    return limitar(resultado, 0, notaMaximaFinal)
  }