import type { BrazilianState } from '@/lib/types/client-profile';

// PLACEHOLDER: custos de inventário por estado/modalidade.
//
// TODO(direito): preencher com parâmetros validados:
//   - Taxa judiciária (varia por estado e por valor do espólio)
//   - Honorários advocatícios sugeridos (tabela OAB do estado, com limites)
//   - Custas de cartório para inventário extrajudicial (CNJ/CNB)
//   - Eventual ITBI residual sobre transmissão de bens imóveis
//
// FONTE: [a ser preenchido]
// DATA DE VERIFICAÇÃO: [a ser preenchido]

export type InventoryCostConfig = {
  state: BrazilianState;
  judicialFeePercent: number;       // taxa judiciária estimada (% sobre espólio)
  notaryFeePercent: number;         // custas extrajudiciais estimadas
  lawyerFeePercentRange: [number, number]; // faixa OAB
  lastVerified: string;
  sourceReference: string;
  notes?: string;
};

// TODO(direito): PREENCHER. Como em itcmd-rates, NÃO usar valores inventados.
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
