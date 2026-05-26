import type { BrazilianState } from '@/lib/types/client-profile';

// PLACEHOLDER: custos de inventário detalhados por estado (para fase futura).
//
// TODO(direito): preencher com parâmetros validados:
//   - Taxa judiciária (varia por estado e por valor do espólio)
//   - Honorários advocatícios sugeridos (tabela OAB do estado, com limites)
//   - Custas de cartório para inventário extrajudicial (CNJ/CNB)
//   - Eventual ITBI residual sobre transmissão de bens imóveis

export type InventoryCostConfig = {
  state: BrazilianState;
  judicialFeePercent: number;
  notaryFeePercent: number;
  lawyerFeePercentRange: [number, number];
  lastVerified: string;
  sourceReference: string;
  notes?: string;
};

// TODO(direito): PREENCHER. Não usar valores inventados.
export const INVENTORY_COSTS: Partial<Record<BrazilianState, InventoryCostConfig>> = {};

export function getInventoryCostConfig(state: BrazilianState): InventoryCostConfig {
  const config = INVENTORY_COSTS[state];
  if (!config) {
    throw new Error(
      `Custos de inventário não configurados para ${state}. ` +
      'Aguardando validação do time de Direito.',
    );
  }
  return config;
}

// ─── Constantes operacionais (validadas pelo time de Direito) ─────────────────

// 6% honorários advocatícios + 3% custas cartorárias/judiciais = 9% total
export const INVENTORY_HONORARIOS_RATE  = 0.06;
export const INVENTORY_CARTORIO_RATE    = 0.03;
export const INVENTORY_TOTAL_RATE       = INVENTORY_HONORARIOS_RATE + INVENTORY_CARTORIO_RATE;

// IR sobre investimentos na transferência causa mortis — art. 23 Lei 9.532/97
export const IR_INVESTIMENTOS_RATE      = 0.15;

// IR sobre ativos offshore — média da faixa 15%–22,5% (Lei 14.754/2023)
export const OFFSHORE_IR_RATE           = 0.175;
// IR offshore com estrutura otimizada (trust/holding offshore)
export const OFFSHORE_IR_OTIMIZADO_RATE = 0.12;

// Desconto de base ITCMD por holding: cotas valem ~35% do valor de mercado
export const HOLDING_DISCOUNT           = 0.35;

// Custo fixo estimado de constituição de holding + trust irrevogável (R$)
export const HOLDING_TRUST_SETUP_COST   = 40_000;

// IR sobre distribuição de lucros via holding
export const IR_DISTRIBUICAO_RATE       = 0.10;

// Custo jurídico de estruturação para doação com offshore (% da base)
export const ESTRUTURACAO_JURIDICA_RATE = 0.02;

// ─── Funções de cálculo ───────────────────────────────────────────────────────

export function calcularCustosInventario(base: number): number {
  return base * INVENTORY_TOTAL_RATE;
}

export function calcularIrInvestimentos(investimentos: number): number {
  return investimentos * IR_INVESTIMENTOS_RATE;
}

export function calcularOffshoreIr(valorOffshore: number, otimizado: boolean): number {
  return valorOffshore * (otimizado ? OFFSHORE_IR_OTIMIZADO_RATE : OFFSHORE_IR_RATE);
}
