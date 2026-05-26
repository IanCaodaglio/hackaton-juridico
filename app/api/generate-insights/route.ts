import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import { getMockTaxAlert } from '@/lib/mocks/tax-window-alerts';
import { getMockNextSteps } from '@/lib/mocks/next-steps';
import { LLM_DISCLAIMER } from '@/lib/disclaimers';
import { formatBRL } from '@/lib/format';
import { MARRIAGE_REGIME_LABELS } from '@/lib/types/client-profile';
import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

// Dados não persistidos por design — LGPD Art. 7º, execução de contrato

export const runtime = 'nodejs';

function isCalculationResult(v: unknown): v is CalculationResult {
  return typeof v === 'object' && v !== null && Array.isArray((v as Record<string, unknown>)['scenarios']);
}

async function callClaude(system: string, user: string): Promise<string | null> {
  const key = process.env['ANTHROPIC_API_KEY'];
  if (!key) return null;
  try {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    return block && block.type === 'text' ? block.text : null;
  } catch (err) {
    console.error('[generate-insights] Claude API error:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}

const SYSTEM_PROMPT = `Você é um assistente especializado em planejamento patrimonial e sucessório brasileiro.
Sua função é gerar análises técnicas para gestores de wealth management — não para clientes finais.

REGRAS OBRIGATÓRIAS:
1. Nunca use linguagem de recomendação direta ("você deve", "recomendamos"). Use "tópico para análise com assessoria jurídica", "ponto a considerar", "item para discussão com advogado habilitado".
2. Cite sempre a base legal quando mencionar um benefício tributário (ex: "conforme STF Tema 1214", "nos termos da Lei 14.754/2023").
3. Para o alerta de janela tributária: mencione o estado do cliente e qualquer PL em tramitação relevante.
4. Para os próximos passos: priorize por impacto financeiro estimado, do maior para o menor.
5. Tom: analítico, técnico, factual. Sem entusiasmo, sem linguagem de marketing.
6. Jamais afirme que a estruturação vai "garantir" qualquer resultado — use "pode resultar em" ou "estimativa baseada em premissas".
7. Responda APENAS em JSON válido, sem markdown, sem texto fora do JSON.

Formato de resposta obrigatório:
{
  "taxWindow": {
    "hasActiveWindow": boolean,
    "alertTitle": string,
    "alertBody": string,
    "urgencyLevel": "low" | "medium" | "high"
  },
  "topicsToDiscuss": [
    {
      "title": string,
      "description": string,
      "category": "legal_structure" | "tax_optimization" | "beneficiary_review" | "documentation",
      "estimatedImpact": string
    }
  ]
}`;

function buildUserPrompt(profile: ClientProfile, calc: CalculationResult): string {
  const noPlanning   = calc.scenarios.find((s) => s.name === 'no_planning');
  const doacaoOffsh  = calc.scenarios.find((s) => s.name === 'donation_plus_offshore');
  const holdingTrust = calc.scenarios.find((s) => s.name === 'holding_plus_trust');

  const fmt = (v: number | undefined) => v !== undefined ? formatBRL(v) : 'não calculado';

  const regimeLbl = profile.marriageRegime
    ? (MARRIAGE_REGIME_LABELS[profile.marriageRegime] ?? profile.marriageRegime)
    : 'não informado';

  const hasIrrevocable = profile.offshoreAssets?.structures.includes('irrevocable_trust') ?? false;

  return `Perfil do cliente:
- Estado de domicílio fiscal: ${profile.state}
- Patrimônio total Brasil (projetado): ${fmt(noPlanning?.breakdown.total)}
- Offshore: ${profile.offshoreAssets ? fmt(profile.offshoreAssets.totalValue) : 'não possui'}
- Trust irrevogável: ${hasIrrevocable ? 'sim' : 'não'}
- Criptoativos: ${profile.cryptoAssets ? fmt(profile.cryptoAssets) : 'não possui'}
- Herdeiros: ${profile.numberOfHeirs}
- Cônjuge: ${profile.hasSpouse ? 'sim' : 'não'}
- Regime de casamento: ${regimeLbl}
- Previdência privada (PGBL/VGBL): ${fmt(profile.composition.privatePension)}
- Horizonte de análise: ${profile.timeHorizon === 0 ? 'hoje' : `${profile.timeHorizon} anos`}
- Objetivo principal: ${profile.primaryGoal}

Resultados do cálculo (patrimônio projetado no horizonte informado):

Sem planejamento:
  Herdeiros recebem: ${fmt(noPlanning?.breakdown.toHeirs)}
  ITCMD: ${fmt(noPlanning?.breakdown.itcmdLoss)}
  Custos de inventário: ${fmt(noPlanning?.breakdown.inventoryCost)}
  IR total: ${fmt(noPlanning?.breakdown.incomeTaxOnInvestments)}

Doação em vida + offshore estruturado:
  Herdeiros recebem: ${fmt(doacaoOffsh?.breakdown.toHeirs)}
  ITCMD antecipado: ${fmt(doacaoOffsh?.breakdown.itcmdLoss)}
  Custos de estruturação: ${fmt(doacaoOffsh?.breakdown.inventoryCost)}

Holding familiar + trust irrevogável:
  Herdeiros recebem: ${fmt(holdingTrust?.breakdown.toHeirs)}
  ITCMD (base reduzida 35%): ${fmt(holdingTrust?.breakdown.itcmdLoss)}
  Custos de constituição: ${fmt(holdingTrust?.breakdown.inventoryCost)}

Economia estimada (melhor cenário vs. sem planejamento): ${fmt(calc.savingsVsNoPlanning)}
${calc.projectedAt8pct && calc.projectedAt8pct.delta > 0
  ? `Impacto de reforma ITCMD para 8% flat: ITCMD atual ${fmt(calc.projectedAt8pct.current)} → com 8%: ${fmt(calc.projectedAt8pct.projected)} (delta: ${fmt(calc.projectedAt8pct.delta)})`
  : 'Estado já opera na alíquota máxima de 8% — sem risco adicional de reforma.'}

Gere a análise nos dois campos solicitados no system prompt.`;
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body deve conter { profile, calculationResult }.' }, { status: 400 });
  }

  const { profile, calculationResult } = body as Record<string, unknown>;
  const profileValidation = validateClientProfile(profile);
  if (!profileValidation.ok) {
    return NextResponse.json({ error: 'Perfil inválido.', details: profileValidation.errors }, { status: 400 });
  }
  if (!isCalculationResult(calculationResult)) {
    return NextResponse.json({ error: 'calculationResult ausente ou inválido.' }, { status: 400 });
  }

  console.log('[generate-insights]', safeProfileMetadata(profileValidation.value));

  const userPrompt   = buildUserPrompt(profileValidation.value, calculationResult);
  const llmResponse  = await callClaude(SYSTEM_PROMPT, userPrompt);

  let taxWindow, topicsToDiscuss;
  if (llmResponse) {
    try {
      const parsed = JSON.parse(llmResponse) as { taxWindow: unknown; topicsToDiscuss: unknown };
      taxWindow       = parsed.taxWindow;
      topicsToDiscuss = parsed.topicsToDiscuss;
    } catch {
      console.error('[generate-insights] Failed to parse Claude response as JSON');
    }
  }

  taxWindow       ??= getMockTaxAlert(profileValidation.value);
  topicsToDiscuss ??= getMockNextSteps(profileValidation.value, calculationResult);

  const insights: InsightsResult = {
    taxWindow:       taxWindow as InsightsResult['taxWindow'],
    topicsToDiscuss: topicsToDiscuss as InsightsResult['topicsToDiscuss'],
    generatedAt:     new Date().toISOString(),
    llmDisclaimer:   LLM_DISCLAIMER,
  };

  return NextResponse.json(insights, { status: 200 });
}
