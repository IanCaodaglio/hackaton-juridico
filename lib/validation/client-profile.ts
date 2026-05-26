import {
  BRAZILIAN_STATES, PLANNING_GOALS,
  type BrazilianState, type ClientProfile, type PlanningGoal,
  type OffshoreStructure, type TimeHorizon,
} from '@/lib/types/client-profile';

export type ValidationError = { field: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: ValidationError[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isFinite_(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v); }
function isBrazilianState(v: unknown): v is BrazilianState {
  return typeof v === 'string' && (BRAZILIAN_STATES as readonly string[]).includes(v);
}
function isPlanningGoal(v: unknown): v is PlanningGoal {
  return typeof v === 'string' && (PLANNING_GOALS as readonly string[]).includes(v);
}
const VALID_TIME_HORIZONS: TimeHorizon[] = [0, 5, 10, 20];
const VALID_OFFSHORE: OffshoreStructure[] = ['direct_account','offshore_company','revocable_trust','irrevocable_trust','international_funds'];

export function validateClientProfile(input: unknown): ValidationResult<ClientProfile> {
  const errors: ValidationError[] = [];
  if (!isObject(input)) return { ok: false, errors: [{ field: 'root', message: 'Body deve ser objeto JSON.' }] };

  if (!isFinite_(input['totalPatrimony']) || (input['totalPatrimony'] as number) < 0)
    errors.push({ field: 'totalPatrimony', message: 'Deve ser número não-negativo.' });
  if (!isBrazilianState(input['state']))
    errors.push({ field: 'state', message: 'Estado inválido.' });
  if (!isObject(input['composition'])) {
    errors.push({ field: 'composition', message: 'Composição patrimonial ausente.' });
  } else {
    for (const key of ['realEstate','investments','companies','privatePension','other']) {
      if (!isFinite_(input['composition'][key]) || (input['composition'][key] as number) < 0)
        errors.push({ field: `composition.${key}`, message: 'Deve ser número não-negativo.' });
    }
  }
  if (!isFinite_(input['numberOfHeirs']) || (input['numberOfHeirs'] as number) < 0)
    errors.push({ field: 'numberOfHeirs', message: 'Deve ser número não-negativo.' });
  if (typeof input['hasSpouse'] !== 'boolean')
    errors.push({ field: 'hasSpouse', message: 'Deve ser booleano.' });
  if (!isPlanningGoal(input['primaryGoal']))
    errors.push({ field: 'primaryGoal', message: 'Objetivo primário inválido.' });

  // timeHorizon
  if (!VALID_TIME_HORIZONS.includes(input['timeHorizon'] as TimeHorizon))
    errors.push({ field: 'timeHorizon', message: 'Deve ser 0, 5, 10 ou 20.' });

  // growthRates
  if (!isObject(input['growthRates'])) {
    errors.push({ field: 'growthRates', message: 'growthRates ausente.' });
  } else {
    for (const key of ['fixedIncome','variableIncome','realEstate','equity','offshore','crypto']) {
      if (!isFinite_(input['growthRates'][key]))
        errors.push({ field: `growthRates.${key}`, message: 'Deve ser número.' });
    }
  }

  // offshoreAssets (opcional)
  if (input['offshoreAssets'] !== undefined && input['offshoreAssets'] !== null) {
    if (!isObject(input['offshoreAssets'])) {
      errors.push({ field: 'offshoreAssets', message: 'Deve ser objeto.' });
    } else {
      if (!isFinite_(input['offshoreAssets']['totalValue']) || (input['offshoreAssets']['totalValue'] as number) < 0)
        errors.push({ field: 'offshoreAssets.totalValue', message: 'Deve ser número não-negativo.' });
      if (!Array.isArray(input['offshoreAssets']['structures']) || !(input['offshoreAssets']['structures'] as unknown[]).every((s) => VALID_OFFSHORE.includes(s as OffshoreStructure)))
        errors.push({ field: 'offshoreAssets.structures', message: 'Estruturas offshore inválidas.' });
    }
  }

  // cryptoAssets (opcional)
  if (input['cryptoAssets'] !== undefined && input['cryptoAssets'] !== null) {
    if (!isFinite_(input['cryptoAssets']) || (input['cryptoAssets'] as number) < 0)
      errors.push({ field: 'cryptoAssets', message: 'Deve ser número não-negativo.' });
  }

  // Coerência: soma da composição vs. total (tolerância 1%)
  if (errors.length === 0 && isObject(input['composition'])) {
    const comp = input['composition'] as Record<string, number>;
    const sum  = (comp['realEstate'] ?? 0) + (comp['investments'] ?? 0) + (comp['companies'] ?? 0) + (comp['privatePension'] ?? 0) + (comp['other'] ?? 0);
    const total = input['totalPatrimony'] as number;
    const tol   = Math.max(total * 0.01, 1);
    if (Math.abs(sum - total) > tol)
      errors.push({ field: 'composition', message: `Soma da composição (${sum.toFixed(0)}) não bate com totalPatrimony (${total.toFixed(0)}). Tolerância 1%.` });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: input as unknown as ClientProfile };
}
