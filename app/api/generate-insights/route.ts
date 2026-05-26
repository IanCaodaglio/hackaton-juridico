import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

// LGPD: igual a /api/calculate-scenarios. Sem persistência, sem log de payload.
//
// SEGURANÇA: este handler é o ÚNICO ponto que deve tocar ANTHROPIC_API_KEY.
// NUNCA expor a chave para o client. NUNCA importar /lib/llm/claude-client.ts
// em componentes "use client".

export const runtime = 'nodejs';

type RequestBody = {
  profile: unknown;
  calculationResult: unknown;
};

function isCalculationResult(v: unknown): v is CalculationResult {
  // TODO(etapa 2): validação granular do CalculationResult quando o shape
  // estiver estável. Por ora, checagem mínima de presença.
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

  // TODO(etapa 3): implementar chamada à Anthropic API.
  //   - Usar /lib/llm/claude-client.ts (callClaude).
  //   - Montar prompts via /lib/llm/prompts.ts (taxWindow + topicsToDiscuss).
  //   - NUNCA expor ANTHROPIC_API_KEY no client.
  //   - Habilitar prompt caching no system prompt.
  //   - Tratar erros (rate limit, timeout, JSON malformado da LLM).
  const placeholder: InsightsResult | null = null;
  if (placeholder === null) {
    return NextResponse.json(
      { error: 'Não implementado. Insights virão na etapa 3.' },
      { status: 501 },
    );
  }

  return NextResponse.json(placeholder, { status: 200 });
}
