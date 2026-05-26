import type { Scenario } from '@/lib/types/calculation-result';
import { calcularItcmd } from './itcmd-rates';
import {
  HOLDING_DISCOUNT,
  HOLDING_TRUST_SETUP_COST,
  IR_DISTRIBUICAO_RATE,
  ESTRUTURACAO_JURIDICA_RATE,
  calcularCustosInventario,
  calcularIrInvestimentos,
  calcularOffshoreIr,
} from './inventory-costs';

export type ScenarioInputs = {
  uf:              string;
  patrimonioTotal: number;   // brasil + offshore + crypto (projetado)
  patrimonioBrasil: number;  // apenas ativos no Brasil (projetado)
  investimentos:   number;   // investimentos financeiros (projetado)
  previdencia:     number;   // PGBL/VGBL — isento de ITCMD (projetado)
  participacoes:   number;   // participações societárias (projetado)
  offshoreValue:   number;   // ativos no exterior (projetado)
};

// ─── Cenário 1: Sem planejamento ─────────────────────────────────────────────
// Transmissão causa mortis sem estrutura prévia. ITCMD calculado com alíquota
// real do estado. Inventário judicial com custos plenos.
export function calcSemPlanejamento(inputs: ScenarioInputs): Scenario {
  const baseItcmd        = inputs.patrimonioBrasil - inputs.previdencia;
  const itcmd            = calcularItcmd(inputs.uf, baseItcmd);
  const irInvestimentos  = calcularIrInvestimentos(inputs.investimentos);
  const custosInventario = calcularCustosInventario(baseItcmd);
  const offshoreIr       = calcularOffshoreIr(inputs.offshoreValue, false);
  const toHeirs          = inputs.patrimonioTotal - itcmd - irInvestimentos - custosInventario - offshoreIr;

  return {
    name:        'no_planning',
    displayName: 'Sem planejamento',
    breakdown: {
      toHeirs,
      itcmdLoss:               itcmd,
      inventoryCost:           custosInventario,
      incomeTaxOnInvestments:  irInvestimentos + offshoreIr,
      total:                   inputs.patrimonioTotal,
    },
    caveats: [
      'Cenário base — transmissão causa mortis sem estrutura prévia.',
      'Custos de inventário estimados em 9% (6% honorários + 3% cartório/taxas judiciais).',
      'Previdência privada (PGBL/VGBL) isenta de ITCMD — STF Tema 1214.',
      'Ativos offshore tributados via IRPF — Lei 14.754/2023 (alíquota efetiva ~17,5%).',
    ],
  };
}

// ─── Cenário 2: Doação em vida + offshore estruturado ────────────────────────
// ITCMD antecipado à alíquota vigente (elimina risco de reforma). Doação com
// reserva de usufruto mantém renda do doador. Offshore via trust/holding
// otimizado. Sem inventário (transmissão inter vivos).
export function calcDoacaoOffshore(inputs: ScenarioInputs): Scenario {
  const baseItcmd           = inputs.patrimonioBrasil - inputs.previdencia;
  const itcmd               = calcularItcmd(inputs.uf, baseItcmd);
  const custosEstruturacao  = baseItcmd * ESTRUTURACAO_JURIDICA_RATE;
  const offshoreIr          = calcularOffshoreIr(inputs.offshoreValue, true);
  const toHeirs             = inputs.patrimonioTotal - itcmd - custosEstruturacao - offshoreIr;

  return {
    name:        'donation_plus_offshore',
    displayName: 'Doação em vida + offshore',
    breakdown: {
      toHeirs,
      itcmdLoss:               itcmd,
      inventoryCost:           custosEstruturacao,
      incomeTaxOnInvestments:  offshoreIr,
      total:                   inputs.patrimonioTotal,
    },
    caveats: [
      'ITCMD antecipado à alíquota vigente — mitiga risco de aumento pós-reforma (EC 132/2023).',
      'Doação com reserva de usufruto: doador mantém renda vitalícia dos ativos doados.',
      'Offshore estruturado via trust/holding: alíquota efetiva otimizada (Lei 14.754/2023).',
      'Custo jurídico de estruturação estimado em 2% da base tributável.',
    ],
  };
}

// ─── Cenário 3: Holding familiar + trust irrevogável ─────────────────────────
// Base ITCMD reduzida ao valor contábil das cotas (35% do valor de mercado).
// Trust irrevogável: bens offshore excluídos do inventário brasileiro.
// Custo fixo de constituição de R$ 40.000.
export function calcHoldingTrust(inputs: ScenarioInputs): Scenario {
  const baseHolding      = (inputs.patrimonioBrasil - inputs.previdencia) * HOLDING_DISCOUNT;
  const itcmd            = calcularItcmd(inputs.uf, baseHolding);
  const irDistribuicao   = inputs.participacoes * IR_DISTRIBUICAO_RATE;
  const toHeirs          = inputs.patrimonioTotal - itcmd - HOLDING_TRUST_SETUP_COST - irDistribuicao;

  return {
    name:        'holding_plus_trust',
    displayName: 'Holding + trust irrevogável',
    breakdown: {
      toHeirs,
      itcmdLoss:               itcmd,
      inventoryCost:           HOLDING_TRUST_SETUP_COST,
      incomeTaxOnInvestments:  irDistribuicao,
      total:                   inputs.patrimonioTotal,
    },
    caveats: [
      'Holding reduz base ITCMD ao valor contábil das cotas (~35% do valor de mercado).',
      'Trust irrevogável: bens offshore excluídos do inventário brasileiro — zero ITCMD offshore.',
      'Custo fixo de R$ 40.000 estimado para constituição de holding patrimonial + trust.',
      'Risco de desconsideração se estrutura constituída em proximidade do óbito — art. 158 CC.',
    ],
  };
}
