import type { ClientProfile } from '@/lib/types/client-profile';
import type { TaxWindowAlert } from '@/lib/types/insights-result';

export function getMockTaxAlert(profile: ClientProfile): TaxWindowAlert {
  const stateAlerts: Partial<Record<string, TaxWindowAlert>> = {
    SP: {
      hasActiveWindow: true,
      alertTitle: 'Janela tributária ativa — ALESP PL 409/2025',
      alertBody:
        'O Estado de São Paulo tramita o PL 409/2025 na Assembleia Legislativa (ALESP), ' +
        'que propõe alíquotas progressivas de ITCMD de até 8% sobre patrimônios transmitidos. ' +
        'A EC 132/2023 tornou a progressividade obrigatória; SP ainda aplica alíquota flat de 4%, ' +
        'mas a aprovação do PL pode elevar substancialmente a carga sobre transmissões de alto valor. ' +
        'Patrimônios acima de R$ 5 mi são os mais expostos ao incremento de alíquota. ' +
        'Ponto para discussão com assessoria jurídica: avaliar a antecipação de estruturação ' +
        'antes da eventual sanção da lei.',
      urgencyLevel: 'high',
    },
    PR: {
      hasActiveWindow: true,
      alertTitle: 'Janela tributária ativa — ALEP PL 730/2024',
      alertBody:
        'O Estado do Paraná tramita o PL 730/2024 na Assembleia Legislativa (ALEP), ' +
        'propondo alíquotas progressivas de ITCMD entre 2% e 8%. ' +
        'A alíquota atual do PR é de 4% (flat). A aprovação do PL elevaria a carga sobre ' +
        'transmissões de maior valor para o dobro da alíquota atual. ' +
        'Item para análise profissional: urgência na avaliação de estruturas de antecipação ' +
        'patrimonial enquanto o PL está em tramitação.',
      urgencyLevel: 'high',
    },
    RJ: {
      hasActiveWindow: true,
      alertTitle: 'Alíquota progressiva já em vigor — RJ 4%–8%',
      alertBody:
        'O Estado do Rio de Janeiro já implementou alíquotas progressivas de ITCMD ' +
        '(4% a 8%), entre os primeiros estados a cumprir a EC 132/2023. ' +
        'Para patrimônios elevados, a alíquota efetiva máxima de 8% está ativa. ' +
        'Ponto para discussão: estruturação patrimonial para redução da base de cálculo.',
      urgencyLevel: 'medium',
    },
  };

  return stateAlerts[profile.state] ?? {
    hasActiveWindow: false,
    alertTitle: `Reforma do ITCMD — ${profile.state}`,
    alertBody:
      `O Estado de ${profile.state} ainda não publicou tabela progressiva de ITCMD nos termos da EC 132/2023. ` +
      'O cenário legislativo nacional aponta para progressividade generalizada nos próximos 12–24 meses. ' +
      'Item para acompanhamento: monitorar tramitação na Assembleia Legislativa estadual.',
    urgencyLevel: 'low',
  };
}
