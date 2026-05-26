export type ItcmdMethod = 'flat' | 'progressive-marginal'
export type ItcmdUnit = 'BRL' | 'UFIR-RJ' | 'UPF-RS'

export interface ItcmdBracket {
  upTo: number | null  // null = sem teto; valor na unidade do estado
  rate: number         // 0.04 = 4%
}

export interface ItcmdStateConfig {
  uf: string
  law: string
  method: ItcmdMethod
  unit: ItcmdUnit
  unitValueBRL2026: number   // valor da unidade em R$ para 2026
  brackets: ItcmdBracket[]
  notes?: string
  lastVerified: string       // ISO date
}

export const ITCMD_STATES: Record<string, ItcmdStateConfig> = {
  SP: {
    uf: 'SP', law: 'Lei 10.705/2000',
    method: 'flat', unit: 'BRL', unitValueBRL2026: 1,
    brackets: [{ upTo: null, rate: 0.04 }],
    notes: 'PL 409/2025 em tramitação na ALESP — progressividade até 8%',
    lastVerified: '2026-05-26',
  },
  RJ: {
    uf: 'RJ', law: 'Lei 7.174/2015',
    method: 'progressive-marginal', unit: 'UFIR-RJ',
    unitValueBRL2026: 4.5136, // TODO: confirmar UFIR-RJ 2026 com time de Direito
    brackets: [
      { upTo: 25000,  rate: 0.04 },
      { upTo: 50000,  rate: 0.045 },
      { upTo: 100000, rate: 0.05 },
      { upTo: 200000, rate: 0.06 },
      { upTo: 400000, rate: 0.07 },
      { upTo: null,   rate: 0.08 },
    ],
    lastVerified: '2026-05-26',
  },
  MG: {
    uf: 'MG', law: 'Lei 14.941/2003',
    method: 'flat', unit: 'BRL', unitValueBRL2026: 1,
    brackets: [{ upTo: null, rate: 0.05 }],
    lastVerified: '2026-05-26',
  },
  RS: {
    uf: 'RS', law: 'Lei 8.821/1989',
    method: 'progressive-marginal', unit: 'UPF-RS',
    unitValueBRL2026: 22.23, // TODO: confirmar UPF-RS 2026 com time de Direito
    brackets: [
      { upTo: 3000,  rate: 0.00 },
      { upTo: 6000,  rate: 0.03 },
      { upTo: 12000, rate: 0.04 },
      { upTo: 24000, rate: 0.05 },
      { upTo: null,  rate: 0.06 },
    ],
    notes: 'Faixas causa mortis. Doação: 3-4%',
    lastVerified: '2026-05-26',
  },
  PR: {
    uf: 'PR', law: 'Lei 18.573/2015',
    method: 'flat', unit: 'BRL', unitValueBRL2026: 1,
    brackets: [{ upTo: null, rate: 0.04 }],
    notes: 'PL 730/2024 em tramitação na ALEP — progressividade 2% a 8%',
    lastVerified: '2026-05-26',
  },
  SC: {
    uf: 'SC', law: 'Lei 13.136/2004 alt. Lei 19.053/2024',
    method: 'progressive-marginal', unit: 'BRL', unitValueBRL2026: 1,
    brackets: [
      { upTo: 20000,  rate: 0.01 },
      { upTo: 50000,  rate: 0.03 },
      { upTo: 100000, rate: 0.05 },
      { upTo: null,   rate: 0.07 },
    ],
    notes: 'Alíquota inicial 1% — exibir como "1% a 7%" no dashboard',
    lastVerified: '2026-05-26',
  },
  DF: {
    uf: 'DF', law: 'Lei 3.804/2006',
    method: 'progressive-marginal', unit: 'BRL', unitValueBRL2026: 1,
    brackets: [
      { upTo: 1000000, rate: 0.04 },
      { upTo: 2000000, rate: 0.05 },
      { upTo: null,    rate: 0.06 },
    ],
    lastVerified: '2026-05-26',
  },
}

/**
 * Calcula ITCMD aplicando método correto (flat ou progressivo marginal).
 * base: valor em R$ (já convertido da unidade do estado se necessário)
 */
export function calcularItcmd(uf: string, baseCalculo: number): number {
  const config = ITCMD_STATES[uf]
  if (!config) return baseCalculo * 0.04  // fallback conservador

  const baseNaUnidade = baseCalculo / config.unitValueBRL2026

  if (config.method === 'flat') {
    return baseCalculo * (config.brackets[0]?.rate ?? 0.04)
  }

  // Progressivo marginal
  let imposto = 0
  let limiteAnterior = 0

  for (const bracket of config.brackets) {
    const limite = bracket.upTo ?? Infinity
    const faixa = Math.min(baseNaUnidade, limite) - limiteAnterior
    if (faixa <= 0) break
    imposto += faixa * config.unitValueBRL2026 * bracket.rate
    limiteAnterior = limite
    if (baseNaUnidade <= limite) break
  }

  return imposto
}
