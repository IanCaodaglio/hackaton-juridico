import {
  BRAZILIAN_STATES,
  PLANNING_GOALS,
  type BrazilianState,
  type ClientProfile,
  type PlanningGoal,
} from '@/lib/types/client-profile';

// Validação manual com type guards. Stubs leves nesta etapa — refinar na
// etapa 2 (mensagens granulares por campo, tolerância configurável, etc.).
// Sem zod por enquanto, como combinado.

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isBrazilianState(v: unknown): v is BrazilianState {
  return typeof v === 'string' && (BRAZILIAN_STATES as readonly string[]).includes(v);
}

function isPlanningGoal(v: unknown): v is PlanningGoal {
  return typeof v === 'string' && (PLANNING_GOALS as readonly string[]).includes(v);
}

export function validateClientProfile(input: unknown): ValidationResult<ClientProfile> {
  const errors: ValidationError[] = [];

  if (!isObject(input)) {
    return { ok: false, errors: [{ field: 'root', message: 'Body deve ser objeto JSON.' }] };
  }

  // TODO(etapa 2): validações granulares (mensagens por campo, faixa numérica,
  // limites razoáveis para detectar typos, etc.).
  if (!isFiniteNumber(input['totalPatrimony']) || input['totalPatrimony'] < 0) {
    errors.push({ field: 'totalPatrimony', message: 'Deve ser número não-negativo.' });
  }
  if (!isBrazilianState(input['state'])) {
    errors.push({ field: 'state', message: 'Estado inválido.' });
  }
  if (!isObject(input['composition'])) {
    errors.push({ field: 'composition', message: 'Composição patrimonial ausente.' });
  } else {
    const comp = input['composition'];
    for (const key of ['realEstate', 'investments', 'companies', 'privatePension', 'other']) {
      if (!isFiniteNumber(comp[key]) || (comp[key] as number) < 0) {
        errors.push({ field: `composition.${key}`, message: 'Deve ser número não-negativo.' });
      }
    }
  }
  if (!isFiniteNumber(input['numberOfHeirs']) || (input['numberOfHeirs'] as number) < 0) {
    errors.push({ field: 'numberOfHeirs', message: 'Deve ser número não-negativo.' });
  }
  if (typeof input['hasSpouse'] !== 'boolean') {
    errors.push({ field: 'hasSpouse', message: 'Deve ser booleano.' });
  }
  if (!isPlanningGoal(input['primaryGoal'])) {
    errors.push({ field: 'primaryGoal', message: 'Objetivo primário inválido.' });
  }
  if (input['secondaryGoals'] !== undefined) {
    if (!Array.isArray(input['secondaryGoals']) || !input['secondaryGoals'].every(isPlanningGoal)) {
      errors.push({ field: 'secondaryGoals', message: 'Objetivos secundários inválidos.' });
    }
  }

  // Coerência: soma da composição deve bater com totalPatrimony (tolerância 1%).
  if (errors.length === 0 && isObject(input['composition'])) {
    const comp = input['composition'] as Record<string, number>;
    const sum =
      comp['realEstate']! + comp['investments']! + comp['companies']! +
      comp['privatePension']! + comp['other']!;
    const total = input['totalPatrimony'] as number;
    const tolerance = Math.max(total * 0.01, 1);
    if (Math.abs(sum - total) > tolerance) {
      errors.push({
        field: 'composition',
        message: `Soma da composição (${sum}) não bate com totalPatrimony (${total}). Tolerância 1%.`,
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // Cast justificado: todos os campos foram validados acima campo a campo.
  return { ok: true, value: input as unknown as ClientProfile };
}
