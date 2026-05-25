import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';

// PLACEHOLDER: orquestração dos três cenários comparativos (bloco 2).
//
// TODO(etapa 2): implementar cálculo determinístico dos três cenários:
//   1. no_planning          → transmissão causa mortis sem planejamento
//   2. lifetime_donation    → doação em vida com reserva de usufruto
//   3. family_holding       → constituição de holding patrimonial familiar
//
// Cada cenário deve produzir um PatrimonialBreakdown completo, considerando:
//   - ITCMD (via itcmd-rates.ts, alíquotas por estado validadas pelo Direito)
//   - Custos de inventário (via inventory-costs.ts)
//   - IR sobre ganhos não realizados (apenas no cenário no_planning;
//     verificar regra do art. 23 da Lei 9.532/97 — transferência por valor
//     de mercado vs. custo de aquisição)
//   - Custos de constituição/manutenção da holding (no cenário 3)
//
// Cada cenário também deve trazer caveats explícitos (riscos de fraude
// contra credores, art. 158 CC; risco de desconsideração da holding;
// limitações da doação com reserva de usufruto).

export function calculateScenarios(profile: ClientProfile): CalculationResult {
  // TODO(etapa 2): implementar. Validar tabela de ITCMD com o time de
  // Direito ANTES de habilitar esta função em produção.
  void profile;
  throw new Error('calculateScenarios não implementado (etapa 2).');
}
