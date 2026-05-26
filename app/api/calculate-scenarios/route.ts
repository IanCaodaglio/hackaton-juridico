import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import { calculateFakeScenarios } from '@/lib/calculations/fake-scenarios';

// LGPD: dados do cliente final NÃO são persistidos. Processados em memória
// e retornados. Logs do servidor registram APENAS metadados — ver
// /lib/logging.ts (safeProfileMetadata).
//
// ETAPA 2: usa cálculo DEMONSTRATIVO de /lib/calculations/fake-scenarios.ts.
// Substituir por /lib/calculations/scenarios.ts (cálculo real) na etapa 3,
// após o time de Direito validar a tabela completa de ITCMD.

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido no body.' }, { status: 400 });
  }

  const validation = validateClientProfile(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'Validação falhou.', details: validation.errors },
      { status: 400 },
    );
  }

  console.log('[calculate-scenarios]', safeProfileMetadata(validation.value));

  const result = calculateFakeScenarios(validation.value);
  return NextResponse.json(result, { status: 200 });
}
