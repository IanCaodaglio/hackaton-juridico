import type { BrazilianState, ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult, Scenario } from '@/lib/types/calculation-result';
import { CALCULATION_DISCLAIMER } from '@/lib/disclaimers';

// AVISO: cálculos simplificados para demo da hackathon.
// Substituir por cálculos reais com tabela ITCMD validada pelo time de
// Direito na etapa 3. Ver /lib/calculations/scenarios.ts (TODO real).

// Alíquotas médias referenciais para os 7 estados do MVP. NÃO usar em
// produção sem validação. Para RJ usamos a média efetiva da progressão
// (4%–8%); demais, alíquota fixa atualmente vigente.
const FAKE_AVG_ITCMD_RATE: Partial<Record<BrazilianState, number>> = {
  SP: 0.04,
  MG: 0.05,
  PR: 0.04,
  RJ: 0.055,
  RS: 0.045,
  SC: 0.05,
  DF: 0.045,
};

// Estimativa de mercado: custas judiciais (~2-4%) + honorários OAB (~4-6%).
const INVENTORY_COST_RATE = 0.06;

// IR sobre ganhos não realizados em transferência (estimativa simplificada
// — na realidade depende de regime do art. 23 da Lei 9.532/97).
const IR_ON_INVESTMENTS_RATE = 0.15;

// Cotas de holding valem ~65% menos que ativos diretos (premissa do laudo
// patrimonial vs. valor de mercado). Reduz a base do ITCMD.
const HOLDING_REDUCTION_FACTOR = 0.35;

export function getFakeItcmdRate(state: BrazilianState): number {
  // Para estados fora do MVP, usar média nacional aproximada.
  return FAKE_AVG_ITCMD_RATE[state] ?? 0.045;
}

export function calculateFakeScenarios(profile: ClientProfile): CalculationResult {
  const itcmdRate = getFakeItcmdRate(profile.state);

  // PGBL/VGBL não entram na base do ITCMD (STF Tema 1214).
  const itcmdBase = profile.totalPatrimony - profile.composition.privatePension;
  const itcmdNoPlanning = itcmdBase * itcmdRate;
  const inventoryNoPlanning = profile.totalPatrimony * INVENTORY_COST_RATE;
  const irNoPlanning = profile.composition.investments * IR_ON_INVESTMENTS_RATE;

  const noPlanning: Scenario = {
    name: 'no_planning',
    displayName: 'Sem planejamento',
    breakdown: {
      toHeirs: profile.totalPatrimony - itcmdNoPlanning - inventoryNoPlanning - irNoPlanning,
      itcmdLoss: itcmdNoPlanning,
      inventoryCost: inventoryNoPlanning,
      incomeTaxOnInvestments: irNoPlanning,
      total: profile.totalPatrimony,
    },
    caveats: [
      'Cenário base de comparação — transmissão causa mortis sem estrutura prévia.',
      'Custos de inventário incluem custas judiciais e honorários estimados.',
      'IR sobre investimentos calculado sobre valor total da carteira (simplificação).',
    ],
  };

  // Doação em vida: zera custos de inventário; IR reduzido por planejamento
  // de realização escalonada.
  const itcmdDonation = itcmdBase * itcmdRate;
  const irDonation = profile.composition.investments * IR_ON_INVESTMENTS_RATE * 0.5;
  const lifetimeDonation: Scenario = {
    name: 'lifetime_donation',
    displayName: 'Doação em vida',
    breakdown: {
      toHeirs: profile.totalPatrimony - itcmdDonation - irDonation,
      itcmdLoss: itcmdDonation,
      inventoryCost: 0,
      incomeTaxOnInvestments: irDonation,
      total: profile.totalPatrimony,
    },
    caveats: [
      'Pressupõe doação com reserva de usufruto para manter renda em vida.',
      'Risco de fragilização patrimonial; necessária reserva de liquidez.',
      'Cláusulas de incomunicabilidade e impenhorabilidade recomendáveis.',
    ],
  };

  // Holding familiar: base do ITCMD reduzida ao valor patrimonial das cotas.
  const itcmdHolding = itcmdBase * itcmdRate * (1 - HOLDING_REDUCTION_FACTOR);
  const registryCostHolding = profile.totalPatrimony * 0.01;
  const familyHolding: Scenario = {
    name: 'family_holding',
    displayName: 'Holding familiar',
    breakdown: {
      toHeirs: profile.totalPatrimony - itcmdHolding - registryCostHolding,
      itcmdLoss: itcmdHolding,
      inventoryCost: registryCostHolding,
      incomeTaxOnInvestments: 0,
      total: profile.totalPatrimony,
    },
    caveats: [
      'Custo de constituição e manutenção da PJ não incluído no cálculo.',
      'Risco de questionamento pelo Fisco se constituída em proximidade do óbito.',
      'Tratamento contábil das cotas (valor patrimonial vs. mercado) sujeito a controvérsia.',
    ],
  };

  const scenarios: Scenario[] = [noPlanning, lifetimeDonation, familyHolding];
  const best = scenarios.reduce((a, b) =>
    a.breakdown.toHeirs > b.breakdown.toHeirs ? a : b,
  );

  return {
    scenarios,
    recommendedScenario: best.name,
    savingsVsNoPlanning: best.breakdown.toHeirs - noPlanning.breakdown.toHeirs,
    calculationDisclaimer: CALCULATION_DISCLAIMER,
  };
}

// Cenário hipotético: se a alíquota progressiva máxima de 8% (teto do
// Senado pós EC 132/2023) for implementada no estado do cliente. Usado
// pelo Bloco 3 (Tax Window).
export function projectItcmdAt8Percent(profile: ClientProfile): {
  current: number;
  projected: number;
  delta: number;
} {
  const itcmdBase = profile.totalPatrimony - profile.composition.privatePension;
  const currentRate = getFakeItcmdRate(profile.state);
  const projectedRate = 0.08;
  const current = itcmdBase * currentRate;
  const projected = itcmdBase * projectedRate;
  return { current, projected, delta: projected - current };
}
