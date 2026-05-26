import type { BrazilianState, ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult, Scenario } from '@/lib/types/calculation-result';
import { CALCULATION_DISCLAIMER } from '@/lib/disclaimers';
import { applyGrowth } from '@/lib/format';

// AVISO: cálculos simplificados para demo. Substituir por tabela real (etapa 3).

const ITCMD_REF: Partial<Record<BrazilianState, number>> = {
  SP: 0.04, MG: 0.05, PR: 0.04, RJ: 0.055,
  RS: 0.045, SC: 0.05, DF: 0.045,
};

const INVENTORY_COST_RATE = 0.06;
const IR_INVESTMENTS_RATE  = 0.15;
const HOLDING_DISCOUNT     = 0.35; // cotas valem ~35% menos → reduz base ITCMD
const TRUST_EXCLUSION_RATE = 0.80; // trust irrevogável: bens excluídos do inventário BR

export function getFakeItcmdRate(state: BrazilianState): number {
  return ITCMD_REF[state] ?? 0.045;
}

export function calculateFakeScenarios(profile: ClientProfile): CalculationResult {
  const rate      = getFakeItcmdRate(profile.state);
  const horizon   = profile.timeHorizon;
  const pension   = profile.composition.privatePension;

  // Projetar patrimônio no horizonte temporal
  const projected = horizon > 0 ? {
    realEstate:     applyGrowth(profile.composition.realEstate,     profile.growthRates.realEstate,     horizon),
    investments:    applyGrowth(profile.composition.investments,    profile.growthRates.variableIncome,  horizon),
    companies:      applyGrowth(profile.composition.companies,      profile.growthRates.equity,          horizon),
    privatePension: applyGrowth(pension,                            profile.growthRates.fixedIncome,     horizon),
    other:          applyGrowth(profile.composition.other,          profile.growthRates.fixedIncome,     horizon),
  } : profile.composition;

  const offshoreValue = profile.offshoreAssets?.totalValue ?? 0;
  const cryptoValue   = profile.cryptoAssets ?? 0;
  const projectedOffshore = horizon > 0
    ? applyGrowth(offshoreValue, profile.growthRates.offshore, horizon)
    : offshoreValue;
  const projectedCrypto = horizon > 0
    ? applyGrowth(cryptoValue, profile.growthRates.crypto, horizon)
    : cryptoValue;

  const totalProjected =
    projected.realEstate + projected.investments + projected.companies +
    projected.privatePension + projected.other + projectedOffshore + projectedCrypto;

  // PGBL/VGBL: isentos de ITCMD (STF Tema 1214)
  // Trust irrevogável: bens não integram inventário brasileiro
  const hasIrrevocable = profile.offshoreAssets?.structures.includes('irrevocable_trust') ?? false;
  const offshoreInBR   = hasIrrevocable ? projectedOffshore * (1 - TRUST_EXCLUSION_RATE) : projectedOffshore;
  const itcmdBase      = totalProjected - projected.privatePension - (projectedOffshore - offshoreInBR);

  // Cenário 1: sem planejamento
  const itcmd1     = itcmdBase * rate;
  const inventory1 = totalProjected * INVENTORY_COST_RATE;
  const ir1        = projected.investments * IR_INVESTMENTS_RATE;
  const noPlanning: Scenario = {
    name: 'no_planning',
    displayName: 'Sem planejamento',
    breakdown: {
      toHeirs: totalProjected - itcmd1 - inventory1 - ir1,
      itcmdLoss: itcmd1,
      inventoryCost: inventory1,
      incomeTaxOnInvestments: ir1,
      total: totalProjected,
    },
    caveats: [
      'Cenário base — transmissão causa mortis sem estrutura prévia.',
      'Custos de inventário incluem custas judiciais e honorários estimados.',
      'Previdência privada (PGBL/VGBL) isenta de ITCMD conforme STF Tema 1214.',
    ],
  };

  // Cenário 2: doação em vida + estrutura offshore
  const itcmd2 = itcmdBase * rate;
  const ir2    = projected.investments * IR_INVESTMENTS_RATE * 0.4;
  const donationPlusOffshore: Scenario = {
    name: 'donation_plus_offshore',
    displayName: 'Doação em vida + offshore',
    breakdown: {
      toHeirs: totalProjected - itcmd2 - ir2,
      itcmdLoss: itcmd2,
      inventoryCost: 0,
      incomeTaxOnInvestments: ir2,
      total: totalProjected,
    },
    caveats: [
      'Pressupõe doação com reserva de usufruto — manutenção de renda em vida.',
      'Lei 14.754/2023: tributação de rendimentos de offshores e trusts desde jan/2024.',
      'Estruturação offshore requer compliance rigoroso (CBE, FATCA, CRS).',
    ],
  };

  // Cenário 3: holding familiar + trust irrevogável
  const itcmd3     = itcmdBase * rate * (1 - HOLDING_DISCOUNT);
  const registry3  = totalProjected * 0.008;
  const holdingPlusTrust: Scenario = {
    name: 'holding_plus_trust',
    displayName: 'Holding + trust irrevogável',
    breakdown: {
      toHeirs: totalProjected - itcmd3 - registry3,
      itcmdLoss: itcmd3,
      inventoryCost: registry3,
      incomeTaxOnInvestments: 0,
      total: totalProjected,
    },
    caveats: [
      'Bens em trust irrevogável não integram inventário brasileiro (posição majoritária).',
      'Holding reduz base de cálculo do ITCMD ao valor patrimonial das cotas.',
      'Risco de desconsideração se constituída em proximidade do óbito — art. 158 CC.',
    ],
  };

  const scenarios = [noPlanning, donationPlusOffshore, holdingPlusTrust];
  const best      = scenarios.reduce((a, b) => a.breakdown.toHeirs > b.breakdown.toHeirs ? a : b);

  const itcmdBase0    = profile.totalPatrimony - pension;
  const currentItcmd  = itcmdBase0 * rate;
  const projectedItcmd = itcmdBase0 * 0.08;

  return {
    scenarios,
    recommendedScenario: best.name,
    savingsVsNoPlanning: best.breakdown.toHeirs - noPlanning.breakdown.toHeirs,
    projectedAt8pct: {
      current:   currentItcmd,
      projected: projectedItcmd,
      delta:     projectedItcmd - currentItcmd,
    },
    calculationDisclaimer: CALCULATION_DISCLAIMER,
  };
}
