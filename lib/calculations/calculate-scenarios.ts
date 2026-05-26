import type { ClientProfile, ScenarioKey } from '@/lib/types/client-profile';
import type { CalculationResult, Scenario, ScenarioName } from '@/lib/types/calculation-result';
import { CALCULATION_DISCLAIMER } from '@/lib/disclaimers';
import { applyGrowth } from '@/lib/format';
import { calcularItcmd } from './itcmd-rates';
import {
  calcSemPlanejamento,
  calcDoacaoOffshore,
  calcHoldingTrust,
  type ScenarioInputs,
} from './scenarios';

const SCENARIO_KEY_MAP: Record<ScenarioKey, ScenarioName> = {
  'sem-planejamento': 'no_planning',
  'doacao-offshore':  'donation_plus_offshore',
  'holding-trust':    'holding_plus_trust',
};

const ALL_SCENARIO_KEYS: ScenarioKey[] = ['sem-planejamento', 'doacao-offshore', 'holding-trust'];

export function calculateScenarios(profile: ClientProfile): CalculationResult {
  const horizon = profile.timeHorizon;
  const rates   = profile.growthRates;

  // Projetar cada classe de ativo no horizonte temporal (compound growth)
  const proj = horizon > 0 ? {
    realEstate:     applyGrowth(profile.composition.realEstate,     rates.realEstate,    horizon),
    investments:    applyGrowth(profile.composition.investments,    rates.variableIncome, horizon),
    companies:      applyGrowth(profile.composition.companies,      rates.equity,         horizon),
    privatePension: applyGrowth(profile.composition.privatePension, rates.fixedIncome,    horizon),
    other:          applyGrowth(profile.composition.other,          rates.fixedIncome,    horizon),
  } : { ...profile.composition };

  const rawOffshore = profile.offshoreAssets?.totalValue ?? 0;
  const rawCrypto   = profile.cryptoAssets ?? 0;
  const projOffshore = horizon > 0 ? applyGrowth(rawOffshore, rates.offshore, horizon) : rawOffshore;
  const projCrypto   = horizon > 0 ? applyGrowth(rawCrypto,   rates.crypto,   horizon) : rawCrypto;

  const patrimonioBrasil = proj.realEstate + proj.investments + proj.companies + proj.privatePension + proj.other;
  const patrimonioTotal  = patrimonioBrasil + projOffshore + projCrypto;

  const inputs: ScenarioInputs = {
    uf:              profile.state,
    patrimonioTotal,
    patrimonioBrasil,
    investimentos:   proj.investments,
    previdencia:     proj.privatePension,
    participacoes:   proj.companies,
    offshoreValue:   projOffshore,
  };

  // Calcular os 3 cenários completos
  const noPlanning  = calcSemPlanejamento(inputs);
  const byName: Record<ScenarioName, Scenario> = {
    no_planning:            noPlanning,
    donation_plus_offshore: calcDoacaoOffshore(inputs),
    holding_plus_trust:     calcHoldingTrust(inputs),
  };

  // Filtrar pelos cenários selecionados pelo profissional — no_planning sempre incluso
  const selectedKeys = profile.scenariosToCompare ?? ALL_SCENARIO_KEYS;
  const selectedNames = new Set<ScenarioName>(['no_planning']);
  for (const key of selectedKeys) {
    const name = SCENARIO_KEY_MAP[key];
    if (name) selectedNames.add(name);
  }

  const orderedNames: ScenarioName[] = ['no_planning', 'donation_plus_offshore', 'holding_plus_trust'];
  const scenarios: Scenario[] = orderedNames
    .filter((n) => selectedNames.has(n))
    .map((n) => byName[n] as Scenario); // Record<ScenarioName, Scenario> é exaustivo

  const best = scenarios.reduce(
    (a, b) => a.breakdown.toHeirs > b.breakdown.toHeirs ? a : b,
    noPlanning,
  );

  // projectedAt8pct: quanto o ITCMD atual difere de uma alíquota flat de 8%
  // Usado pelo Bloco 1 para o alerta âmbar de risco de reforma
  const baseItcmd   = patrimonioBrasil - proj.privatePension;
  const itcmdAtual  = calcularItcmd(profile.state, baseItcmd);
  const itcmdAt8pct = baseItcmd * 0.08;

  return {
    scenarios,
    recommendedScenario:   best.name,
    savingsVsNoPlanning:   best.breakdown.toHeirs - noPlanning.breakdown.toHeirs,
    projectedAt8pct: {
      current:   itcmdAtual,
      projected: itcmdAt8pct,
      delta:     itcmdAt8pct - itcmdAtual,
    },
    calculationDisclaimer: CALCULATION_DISCLAIMER,
  };
}
