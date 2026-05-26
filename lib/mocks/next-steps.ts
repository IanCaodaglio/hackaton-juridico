import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { NextStep } from '@/lib/types/insights-result';

// Geração mockada da lista de tópicos para discussão (Bloco 4).
// Lógica determinística baseada em features do perfil. Na etapa 3,
// substituir por geração via Claude API com prompts validados.

// IMPORTANTE: NUNCA usar verbos no imperativo direto ("recomendamos", "você deve").
// Tom: "tópico para discussão", "item para análise", "ponto a revisar com
// profissional habilitado".

export function getMockNextSteps(
  profile: ClientProfile,
  _calculation: CalculationResult,
): NextStep[] {
  const steps: NextStep[] = [];
  const comp = profile.composition;
  const total = profile.totalPatrimony || 1;

  // 1. Se há participação societária → holding e estruturação societária
  if (comp.companies > 0) {
    steps.push({
      title: 'Estruturação societária e constituição de holding familiar',
      description:
        'Análise da viabilidade de transferência das participações para holding ' +
        'patrimonial, com avaliação de impacto sobre governança corporativa, ' +
        'distribuição de lucros e regime de tributação das cotas.',
      category: 'legal_structure',
    });
  }

  // 2. Se há previdência privada → revisão de beneficiários e Tema 1214 STF
  if (comp.privatePension > 0) {
    steps.push({
      title: 'Revisão de beneficiários PGBL/VGBL e impacto do Tema 1214 STF',
      description:
        'Verificação da designação de beneficiários nos planos PGBL/VGBL à luz da ' +
        'decisão do STF (Tema 1214) que afasta a incidência de ITCMD sobre o VGBL. ' +
        'Atualização da cláusula beneficiária e revisão da carteira para otimização ' +
        'da blindagem sucessória.',
      category: 'beneficiary_review',
    });
  }

  // 3. Se imóveis > 30% do patrimônio → doação com reserva de usufruto
  if (comp.realEstate / total > 0.3) {
    steps.push({
      title: 'Antecipação de doação imobiliária com reserva de usufruto',
      description:
        'Estudo da transmissão antecipada dos imóveis aos herdeiros com reserva de ' +
        'usufruto vitalício para o doador, preservando renda e direito de uso. ' +
        'Análise de cláusulas de incomunicabilidade, impenhorabilidade e ' +
        'inalienabilidade aplicáveis ao caso.',
      category: 'tax_optimization',
    });
  }

  // 4. Se número de herdeiros > 2 → partilha em vida / acordo familiar
  if (profile.numberOfHeirs > 2) {
    steps.push({
      title: 'Partilha em vida e protocolo familiar',
      description:
        'Discussão de instrumentos de partilha antecipada e protocolo familiar como ' +
        'mecanismos preventivos de litígio sucessório. Avaliação de cláusulas de ' +
        'mediação obrigatória e regras de governança patrimonial intergeracional.',
      category: 'legal_structure',
    });
  }

  // 5. Se há cônjuge → revisão de regime de bens
  if (profile.hasSpouse) {
    steps.push({
      title: 'Revisão do regime de bens do casamento',
      description:
        'Análise do regime de bens vigente e avaliação de eventual pacto antenupcial ' +
        'ou alteração de regime (art. 1.639, §2º do Código Civil) frente aos objetivos ' +
        'sucessórios do casal. Impacto sobre meação e quinhão hereditário.',
      category: 'legal_structure',
    });
  }

  // 6. Sempre incluir: atualização de testamento
  steps.push({
    title: 'Elaboração ou atualização de testamento',
    description:
      'Revisão da existência e do conteúdo de testamento à luz da configuração ' +
      'patrimonial atual. Análise da utilização das parcelas disponível e legítima, ' +
      'eventual nomeação de testamenteiro e instituição de fideicomisso.',
    category: 'documentation',
  });

  // 7. Sempre incluir: documentação patrimonial consolidada
  steps.push({
    title: 'Consolidação documental do patrimônio',
    description:
      'Organização e atualização da documentação dos bens (escrituras, certidões, ' +
      'contratos sociais, extratos), facilitando eventual processo de inventário e ' +
      'reduzindo custos e prazos. Mapeamento de pendências documentais.',
    category: 'documentation',
  });

  // Limitar a 6 itens (priorizando os condicionais sobre os fixos)
  return steps.slice(0, 6);
}
