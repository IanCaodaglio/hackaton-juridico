import { NextResponse } from 'next/server';
import { validateClientProfile } from '@/lib/validation/client-profile';
import { safeProfileMetadata } from '@/lib/logging';
import type { CalculationResult } from '@/lib/types/calculation-result';

// LGPD — IMPORTANTE:
// Por design, dados do cliente final NÃO são persistidos. Esta rota processa
// o payload em memória e retorna o resultado. Os logs do servidor devem
// registrar APENAS metadados (estado, ordem de grandeza do patrimônio),
// nunca valores absolutos nem a composição patrimonial.
// Ver /lib/logging.ts.

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido no body.' },
      { status: 400 },
    );
  }

  const validation = validateClientProfile(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'Validação falhou.', details: validation.errors },
      { status: 400 },
    );
  }

  // Log seguro (metadados apenas).
  console.log('[calculate-scenarios]', safeProfileMetadata(validation.value));

  // TODO(etapa 2): implementar cálculos em /lib/calculations/scenarios.ts.
  // Validar tabela de ITCMD com o time de Direito antes. Por ora, retorna
  // 501 explícito para tornar o stub óbvio durante a integração.
  const placeholder: CalculationResult | null = null;
  if (placeholder === null) {
    return NextResponse.json(
      { error: 'Não implementado. Cálculos virão na etapa 2.' },
      { status: 501 },
    );
  }

  return NextResponse.json(placeholder, { status: 200 });
}
