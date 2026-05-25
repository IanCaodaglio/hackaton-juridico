import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';

// PLACEHOLDER: prompts dos blocos 3 (tax window) e 4 (topics to discuss).
//
// TODO(etapa 3): redigir prompts em conjunto com o time de Direito.
// DIRETRIZES:
//   - Linguagem em pt-BR, formal mas acessível.
//   - O modelo NUNCA deve produzir "recomendação", "orientação", "parecer".
//     Usar: "pontos para discussão", "considerações", "itens para análise
//     com profissional habilitado".
//   - O modelo NUNCA deve afirmar prazos legais específicos sem ressalva
//     ("verificar legislação estadual vigente").
//   - O modelo NUNCA deve citar nomes de leis/artigos sem que o time de
//     Direito tenha validado o prompt.
//   - Saída em JSON estruturado (ver tipos em /lib/types/insights-result.ts).

export function buildTaxWindowPrompt(
  _profile: ClientProfile,
  _calc: CalculationResult,
): { system: string; user: string } {
  // TODO(etapa 3): preencher.
  return {
    system: 'TODO: system prompt do bloco 3 (janela tributária).',
    user: 'TODO: user prompt com perfil + resultado do cálculo.',
  };
}

export function buildTopicsToDiscussPrompt(
  _profile: ClientProfile,
  _calc: CalculationResult,
): { system: string; user: string } {
  // TODO(etapa 3): preencher.
  return {
    system: 'TODO: system prompt do bloco 4 (pontos para discussão).',
    user: 'TODO: user prompt com perfil + resultado do cálculo.',
  };
}
