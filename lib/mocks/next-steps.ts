import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { NextStep } from '@/lib/types/insights-result';
import { formatBRLCompact } from '@/lib/format';

export function getMockNextSteps(
  profile: ClientProfile,
  calc: CalculationResult,
): NextStep[] {
  const steps: NextStep[] = [];
  const savings = calc.savingsVsNoPlanning;
  const best    = calc.recommendedScenario;

  if (best === 'holding_plus_trust') {
    steps.push({
      title: 'Constituição de holding patrimonial familiar',
      description:
        'Avaliação da viabilidade de constituir holding para concentrar ativos imobiliários e participações societárias. ' +
        'O valor patrimonial das cotas pode reduzir a base de cálculo do ITCMD em até 35%.',
      category: 'legal_structure',
      estimatedImpact: `Economia estimada de ${formatBRLCompact(savings)} em ITCMD`,
    });
  }

  if ((profile.offshoreAssets?.totalValue ?? 0) > 0) {
    const hasIrrevocable = profile.offshoreAssets?.structures.includes('irrevocable_trust') ?? false;
    steps.push({
      title: hasIrrevocable
        ? 'Revisão da estrutura de trust irrevogável'
        : 'Avaliação de trust irrevogável para ativos internacionais',
      description:
        hasIrrevocable
          ? 'Verificar se o trust atende aos requisitos de irrevogabilidade perante o direito brasileiro e a Lei 14.754/2023. Bens em trust irrevogável não integram o inventário brasileiro (posição majoritária).'
          : 'Ponto para discussão: constituição de trust irrevogável em jurisdição adequada pode excluir ativos internacionais do inventário e reduzir a base de ITCMD no Brasil.',
      category: 'legal_structure',
      estimatedImpact: `Ativos offshore: ${formatBRLCompact(profile.offshoreAssets?.totalValue ?? 0)}`,
    });
  }

  if (profile.composition.privatePension > 0) {
    steps.push({
      title: 'Revisão dos beneficiários da previdência privada',
      description:
        'PGBL/VGBL não integram o inventário e são isentos de ITCMD (STF Tema 1214, jan/2025). ' +
        'Verificar se a cláusula de beneficiários está atualizada e alinhada ao planejamento sucessório.',
      category: 'beneficiary_review',
      estimatedImpact: `Previdência fora do inventário: ${formatBRLCompact(profile.composition.privatePension)}`,
    });
  }

  if (profile.hasSpouse) {
    steps.push({
      title: 'Revisão do regime de casamento e meação',
      description:
        'O regime matrimonial impacta diretamente a composição do espólio e a base de cálculo do ITCMD. ' +
        'Verificar adequação entre regime vigente e objetivos de proteção do cônjuge.',
      category: 'documentation',
      estimatedImpact: 'Impacto na delimitação do espólio',
    });
  }

  if ((profile.cryptoAssets ?? 0) > 0) {
    steps.push({
      title: 'Planejamento para ativos digitais',
      description:
        'Criptoativos sem planejamento representam risco de perda total na sucessão. ' +
        'Ponto para análise: custódia institucional, instrução de acesso para herdeiros e declaração na CBE/IRPF.',
      category: 'documentation',
      estimatedImpact: `Cripto: ${formatBRLCompact(profile.cryptoAssets ?? 0)}`,
    });
  }

  steps.push({
    title: 'Atualização do inventário patrimonial documentado',
    description:
      'Manter inventário atualizado de todos os ativos com documentação de titularidade ' +
      'reduz significativamente o custo e prazo do processo sucessório.',
    category: 'documentation',
    estimatedImpact: 'Redução estimada de 30–50% no prazo de inventário',
  });

  return steps.slice(0, 5);
}
