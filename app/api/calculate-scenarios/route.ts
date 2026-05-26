import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import { calculateScenarios } from '@/lib/calculations/calculate-scenarios';

// Dados não persistidos por design — LGPD Art. 7º, execução de contrato

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const validation = validateClientProfile(body);
  if (!validation.ok) {
    return NextResponse.json({ error: 'Validação falhou.', details: validation.errors }, { status: 400 });
  }

  console.log('[calculate-scenarios]', safeProfileMetadata(validation.value));
  return NextResponse.json(calculateScenarios(validation.value), { status: 200 });
}
