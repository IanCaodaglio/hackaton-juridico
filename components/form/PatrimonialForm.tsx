'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BRAZILIAN_STATES,
  PLANNING_GOALS,
  PLANNING_GOAL_LABELS,
  type BrazilianState,
  type ClientProfile,
  type PlanningGoal,
} from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

// Abordagem de transporte entre /form e /report:
// usamos sessionStorage (client-only, descartado ao fechar a aba).
// Decisão consciente: NÃO usar query string (dados sensíveis na URL/histórico)
// e NÃO usar persistência server-side (LGPD — sem retenção).
const STORAGE_KEY = 'patrimonialReportData';

type FormState = {
  totalPatrimony: string;
  state: BrazilianState | '';
  realEstate: string;
  investments: string;
  companies: string;
  privatePension: string;
  other: string;
  numberOfHeirs: string;
  hasSpouse: boolean;
  primaryGoal: PlanningGoal | '';
  secondaryGoals: PlanningGoal[];
};

const INITIAL_STATE: FormState = {
  totalPatrimony: '',
  state: '',
  realEstate: '',
  investments: '',
  companies: '',
  privatePension: '',
  other: '',
  numberOfHeirs: '',
  hasSpouse: false,
  primaryGoal: '',
  secondaryGoals: [],
};

function toNumber(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function PatrimonialForm(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compositionSum = useMemo(() => {
    return (
      (toNumber(form.realEstate) || 0) +
      (toNumber(form.investments) || 0) +
      (toNumber(form.companies) || 0) +
      (toNumber(form.privatePension) || 0) +
      (toNumber(form.other) || 0)
    );
  }, [form.realEstate, form.investments, form.companies, form.privatePension, form.other]);

  const total = toNumber(form.totalPatrimony) || 0;
  const tolerance = Math.max(total * 0.01, 1);
  const compositionMismatch = total > 0 && Math.abs(compositionSum - total) > tolerance;

  function update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSecondaryGoal(goal: PlanningGoal): void {
    setForm((prev) => {
      const exists = prev.secondaryGoals.includes(goal);
      return {
        ...prev,
        secondaryGoals: exists
          ? prev.secondaryGoals.filter((g) => g !== goal)
          : [...prev.secondaryGoals, goal],
      };
    });
  }

  function buildProfile(): ClientProfile | null {
    if (!form.state || !form.primaryGoal) return null;
    const profile: ClientProfile = {
      totalPatrimony: toNumber(form.totalPatrimony),
      state: form.state,
      composition: {
        realEstate: toNumber(form.realEstate) || 0,
        investments: toNumber(form.investments) || 0,
        companies: toNumber(form.companies) || 0,
        privatePension: toNumber(form.privatePension) || 0,
        other: toNumber(form.other) || 0,
      },
      numberOfHeirs: toNumber(form.numberOfHeirs),
      hasSpouse: form.hasSpouse,
      primaryGoal: form.primaryGoal,
      ...(form.secondaryGoals.length > 0 ? { secondaryGoals: form.secondaryGoals } : {}),
    };
    return profile;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    const profile = buildProfile();
    if (!profile) {
      setError('Preencha estado e objetivo primário.');
      return;
    }
    if (compositionMismatch) {
      setError('A soma da composição não bate com o patrimônio total (tolerância 1%).');
      return;
    }

    setSubmitting(true);
    try {
      const calcRes = await fetch('/api/calculate-scenarios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!calcRes.ok) {
        // Stub atual retorna 501. Erro real virá na etapa 2.
        const detail = await calcRes.text();
        throw new Error(`Falha em /api/calculate-scenarios (${calcRes.status}): ${detail}`);
      }
      const calculationResult = (await calcRes.json()) as CalculationResult;

      const insightsRes = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile, calculationResult }),
      });
      if (!insightsRes.ok) {
        const detail = await insightsRes.text();
        throw new Error(`Falha em /api/generate-insights (${insightsRes.status}): ${detail}`);
      }
      const insightsResult = (await insightsRes.json()) as InsightsResult;

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, calculationResult, insightsResult }),
      );
      router.push('/report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Dados gerais</legend>

        <label className="block">
          <span className="text-sm">Patrimônio total (R$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.totalPatrimony}
            onChange={(e) => update('totalPatrimony', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm">Estado</span>
          <select
            required
            value={form.state}
            onChange={(e) => update('state', e.target.value as BrazilianState | '')}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Selecione…</option>
            {BRAZILIAN_STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Composição patrimonial (R$)</legend>
        {(
          [
            ['realEstate', 'Imóveis'],
            ['investments', 'Investimentos financeiros'],
            ['companies', 'Participação em empresas'],
            ['privatePension', 'Previdência privada (PGBL/VGBL)'],
            ['other', 'Outros'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-sm">{label}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
        ))}
        <p className={`text-sm ${compositionMismatch ? 'text-red-600' : 'text-neutral-600'}`}>
          Soma: R$ {compositionSum.toLocaleString('pt-BR')} {total > 0 && (
            <>(total informado: R$ {total.toLocaleString('pt-BR')})</>
          )}
        </p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Família</legend>
        <label className="block">
          <span className="text-sm">Número de herdeiros</span>
          <input
            type="number"
            min={0}
            step="1"
            required
            value={form.numberOfHeirs}
            onChange={(e) => update('numberOfHeirs', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.hasSpouse}
            onChange={(e) => update('hasSpouse', e.target.checked)}
          />
          <span className="text-sm">Possui cônjuge / companheiro(a)</span>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Objetivos do planejamento</legend>
        <label className="block">
          <span className="text-sm">Objetivo primário</span>
          <select
            required
            value={form.primaryGoal}
            onChange={(e) => update('primaryGoal', e.target.value as PlanningGoal | '')}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Selecione…</option>
            {PLANNING_GOALS.map((g) => (
              <option key={g} value={g}>{PLANNING_GOAL_LABELS[g]}</option>
            ))}
          </select>
        </label>
        <div>
          <span className="text-sm">Objetivos secundários (opcional)</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PLANNING_GOALS.filter((g) => g !== form.primaryGoal).map((g) => (
              <label key={g} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.secondaryGoals.includes(g)}
                  onChange={() => toggleSecondaryGoal(g)}
                />
                <span className="text-sm">{PLANNING_GOAL_LABELS[g]}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? 'Calculando…' : 'Gerar relatório'}
      </button>
    </form>
  );
}
