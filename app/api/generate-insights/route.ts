import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import { getMockTaxAlert } from '@/lib/mocks/tax-window-alerts';
import { getMockNextSteps } from '@/lib/mocks/next-steps';
import { LLM_DISCLAIMER } from '@/lib/disclaimers';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

// LGPD: idem /api/calculate-scenarios. Sem persistência, sem log de payload.
//
// ETAPA 2: retorna conteúdo MOCKADO via /lib/mocks/*. Sem chamada à
// Anthropic API. Substituir por chamadas reais ao Claude na etapa 3
// (ver /lib/llm/claude-client.ts).

export const runtime = 'nodejs';

type RequestBody = {
  profile: unknown;
  calculationResult: unknown;
};

function isCalculationResult(v: unknown): v is CalculationResult {
  // Validação mínima — etapa 3 fará type guard completo.
  return (
    typeof v === 'object' && v !== null &&
    Array.isArray((v as Record<string, unknown>)['scenarios'])
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido no body.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: 'Body deve conter { profile, calculationResult }.' },
      { status: 400 },
    );
  }

  const { profile, calculationResult } = body as RequestBody;

  const profileValidation = validateClientProfile(profile);
  if (!profileValidation.ok) {
    return NextResponse.json(
      { error: 'Perfil inválido.', details: profileValidation.errors },
      { status: 400 },
    );
  }
  if (!isCalculationResult(calculationResult)) {
    return NextResponse.json(
      { error: 'calculationResult ausente ou inválido.' },
      { status: 400 },
    );
  }

  console.log('[generate-insights]', safeProfileMetadata(profileValidation.value));

  const insights: InsightsResult = {
    taxWindow: getMockTaxAlert(profileValidation.value),
    topicsToDiscuss: getMockNextSteps(profileValidation.value, calculationResult),
    generatedAt: new Date().toISOString(),
    llmDisclaimer: LLM_DISCLAIMER,
  };

  return NextResponse.json(insights, { status: 200 });
}
