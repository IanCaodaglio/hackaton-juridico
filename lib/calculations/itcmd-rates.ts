import type { BrazilianState } from '@/lib/types/client-profile';

// FONTE DAS ALÍQUOTAS: [a ser preenchido pelo time de Direito]
// DATA DE VERIFICAÇÃO: [a ser preenchido — formato ISO 8601]
//
// IMPORTANTE: A EC 132/2023 tornou o ITCMD progressivo obrigatório, mas a
// maioria dos estados ainda não publicou as tabelas progressivas. Verificar
// caso a caso se o estado já implementou ou se ainda vigora a alíquota
// anterior. Em caso de dúvida, sinalizar no campo `notes` e NÃO usar valor
// inventado como fallback.

export type ItcmdBracket = {
  minValue: number;
  maxValue: number | null; // null para faixa superior (sem teto)
  rate: number;            // 0.04 = 4%
};

export type StateItcmdConfig = {
  state: BrazilianState;
  brackets: ItcmdBracket[];
  lastVerified: string;    // data ISO 8601
  sourceLaw: string;       // ex: "Lei estadual nº X/AAAA"
  notes?: string;
};

// TODO(direito): PREENCHER COM DADOS VALIDADOS PELO TIME DE DIREITO.
// Por ora, mantemos o Record vazio. As funções consumidoras devem lançar
// erro explícito ao tentar acessar um estado não preenchido — NÃO usar
// valores inventados como fallback (risco jurídico e de produto).
export const ITCMD_RATES: Partial<Record<BrazilianState, StateItcmdConfig>> = {
  // Exemplo de estrutura (NÃO usar — dados não validados):
  // SP: {
  //   state: 'SP',
  //   brackets: [{ minValue: 0, maxValue: null, rate: 0.04 }],
  //   lastVerified: 'YYYY-MM-DD',
  //   sourceLaw: 'Lei estadual nº ...',
  //   notes: 'Verificar status da progressividade pós EC 132/2023.',
  // },
};

export function getItcmdConfig(state: BrazilianState): StateItcmdConfig {
  const config = ITCMD_RATES[state];
  if (!config) {
    throw new Error(
      `ITCMD não configurado para o estado ${state}. ` +
      'Aguardando validação do time de Direito. ' +
      'Não é seguro estimar sem fonte verificada.',
    );
  }
  return config;
}
