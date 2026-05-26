import type { BrazilianState, ClientProfile } from '@/lib/types/client-profile';
import type { TaxWindowAlert, UrgencyLevel } from '@/lib/types/insights-result';
import { projectItcmdAt8Percent, getFakeItcmdRate } from '@/lib/calculations/fake-scenarios';
import { formatBRL, formatPercent } from '@/lib/format';

// Conteúdo MOCKADO por estado. Na etapa 3, substituir por geração via
// Claude API a partir de prompts validados pelo time de Direito.
// Textos escritos em tom analítico-jurídico, sem hedging típico de LLM.

type StateAlertTemplate = {
  hasActiveWindow: boolean;
  urgencyLevel: UrgencyLevel;
  paragraphs: (ctx: AlertContext) => string[];
};

type AlertContext = {
  state: BrazilianState;
  currentRate: number;
  projectedItcmd: number;
  currentItcmd: number;
  delta: number;
};

const SP_TEMPLATE: StateAlertTemplate = {
  hasActiveWindow: true,
  urgencyLevel: 'high',
  paragraphs: (ctx) => [
    'A Emenda Constitucional 132/2023 tornou obrigatória a progressividade ' +
    'do ITCMD em todos os estados, autorizando alíquotas de até 8%. A ' +
    'definição das faixas e alíquotas cabe à legislação estadual.',
    `Em São Paulo, o PL 409/25 — em tramitação na ALESP — propõe a substituição ` +
    `da atual alíquota linear de ${formatPercent(ctx.currentRate)} por estrutura ` +
    `progressiva de 2% a 8% conforme o valor transmitido. A votação está prevista ` +
    `para o ciclo legislativo corrente.`,
    'Enquanto o novo regime não entra em vigor, atos de planejamento sucessório ' +
    'realizados sob a legislação atual permanecem regidos pela alíquota vigente ' +
    'na data do fato gerador. Doações formalizadas antes da publicação da nova ' +
    'lei tendem a preservar o tratamento atual.',
    `Projeção do impacto: caso a alíquota máxima de 8% se aplique ao patrimônio ` +
    `do cliente, o ITCMD passaria de ${formatBRL(ctx.currentItcmd, false)} para ` +
    `${formatBRL(ctx.projectedItcmd, false)} — diferença de ${formatBRL(ctx.delta, false)}.`,
    'Recomenda-se acompanhamento das próximas sessões da Comissão de Constituição ' +
    'e Justiça e mapeamento de eventual janela temporal entre a sanção da lei ' +
    'e sua vigência efetiva (princípio da anterioridade anual e nonagesimal).',
  ],
};

const PR_TEMPLATE: StateAlertTemplate = {
  hasActiveWindow: true,
  urgencyLevel: 'high',
  paragraphs: (ctx) => [
    'A Emenda Constitucional 132/2023 estabeleceu a progressividade obrigatória ' +
    'do ITCMD, com teto de 8% definido pelo Senado Federal (Resolução 9/1992, ' +
    'pendente de revisão).',
    `O Paraná discute o tema via PL 730/2024, que propõe a transição da alíquota ` +
    `linear de ${formatPercent(ctx.currentRate)} para faixas progressivas de 2% a 8%. ` +
    `A proposta segue em análise na ALEP.`,
    'A janela temporal entre a sanção da lei e o início da vigência (anterioridade ' +
    'anual e nonagesimal) tende a abrir um período de planejamento sucessório ' +
    'sob a regra atual.',
    `Cenário projetado: aplicada a alíquota máxima de 8%, o ITCMD passaria de ` +
    `${formatBRL(ctx.currentItcmd, false)} para ${formatBRL(ctx.projectedItcmd, false)} ` +
    `— diferença de ${formatBRL(ctx.delta, false)}.`,
  ],
};

const GENERIC_TEMPLATE: StateAlertTemplate = {
  hasActiveWindow: true,
  urgencyLevel: 'medium',
  paragraphs: (ctx) => [
    'A Emenda Constitucional 132/2023 tornou obrigatória a progressividade do ' +
    'ITCMD em todos os estados, com teto de 8% (Resolução 9/1992 do Senado, ' +
    'pendente de revisão pelo PRS 57/2019).',
    `No estado do cliente (${ctx.state}), a alíquota atual referencial é de ` +
    `${formatPercent(ctx.currentRate)}. A adequação à EC 132/2023 dependerá de lei ` +
    'estadual específica; movimento legislativo ainda em formação.',
    'Enquanto a nova legislação estadual não é publicada, atos de planejamento ' +
    'realizados sob a regra atual preservam o regime vigente na data do fato ' +
    'gerador, ressalvada a aplicação da anterioridade.',
    `Projeção do impacto: aplicada a alíquota máxima de 8%, o ITCMD passaria de ` +
    `${formatBRL(ctx.currentItcmd, false)} para ${formatBRL(ctx.projectedItcmd, false)} ` +
    `— diferença de ${formatBRL(ctx.delta, false)}.`,
  ],
};

const TEMPLATES: Partial<Record<BrazilianState, StateAlertTemplate>> = {
  SP: SP_TEMPLATE,
  PR: PR_TEMPLATE,
};

const STATE_NAMES: Record<BrazilianState, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export function getStateName(state: BrazilianState): string {
  return STATE_NAMES[state];
}

export function getMockTaxAlert(profile: ClientProfile): TaxWindowAlert {
  const template = TEMPLATES[profile.state] ?? GENERIC_TEMPLATE;
  const projection = projectItcmdAt8Percent(profile);
  const ctx: AlertContext = {
    state: profile.state,
    currentRate: getFakeItcmdRate(profile.state),
    projectedItcmd: projection.projected,
    currentItcmd: projection.current,
    delta: projection.delta,
  };
  return {
    hasActiveWindow: template.hasActiveWindow,
    urgencyLevel: template.urgencyLevel,
    alertTitle: `Janela tributária ativa em ${getStateName(profile.state)}`,
    alertBody: template.paragraphs(ctx).join('\n\n'),
  };
}
