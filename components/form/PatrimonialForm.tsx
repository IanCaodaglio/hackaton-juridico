'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CurrencyInput from '@/components/ui/CurrencyInput';
import {
  PLANNING_GOALS,
  PLANNING_GOAL_LABELS,
  type BrazilianState,
  type ClientProfile,
  type PlanningGoal,
} from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';
import { formatBRL } from '@/lib/format';

const STORAGE_KEY = 'patrimonialReportData';

// MVP cobre 7 estados. Demais ufs ficam fora do select (a validação
// dos tipos ainda aceita todos, mas o produto só oferece esses 7).
const MVP_STATES: { value: BrazilianState; label: string }[] = [
  { value: 'SP', label: 'São Paulo' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'PR', label: 'Paraná' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'DF', label: 'Distrito Federal' },
];

type FormState = {
  totalCents: number;
  state: BrazilianState | '';
  realEstateCents: number;
  investmentsCents: number;
  companiesCents: number;
  privatePensionCents: number;
  otherCents: number;
  numberOfHeirs: string;
  hasSpouse: boolean | null;
  primaryGoal: PlanningGoal | '';
};

const INITIAL: FormState = {
  totalCents: 0,
  state: '',
  realEstateCents: 0,
  investmentsCents: 0,
  companiesCents: 0,
  privatePensionCents: 0,
  otherCents: 0,
  numberOfHeirs: '',
  hasSpouse: null,
  primaryGoal: '',
};

export default function PatrimonialForm(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const composition = useMemo(
    () => ({
      total: form.totalCents / 100,
      sum:
        (form.realEstateCents +
          form.investmentsCents +
          form.companiesCents +
          form.privatePensionCents +
          form.otherCents) /
        100,
    }),
    [form],
  );

  const diff = composition.sum - composition.total;
  const tolerance = Math.max(composition.total * 0.01, 1);
  const compositionOk = composition.total > 0 && Math.abs(diff) <= tolerance;
  const compositionInvalid = composition.total > 0 && Math.abs(diff) > tolerance;

  // Progresso visual (0–100%) da soma vs. total
  const progressPct =
    composition.total > 0
      ? Math.min(100, Math.max(0, (composition.sum / composition.total) * 100))
      : 0;

  const heirs = Number(form.numberOfHeirs);
  const heirsValid = Number.isInteger(heirs) && heirs >= 1 && heirs <= 20;

  const isValid =
    composition.total > 0 &&
    form.state !== '' &&
    compositionOk &&
    heirsValid &&
    form.hasSpouse !== null &&
    form.primaryGoal !== '';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!isValid || !form.state || !form.primaryGoal || form.hasSpouse === null) {
      setError('Revise os campos destacados antes de prosseguir.');
      return;
    }

    const profile: ClientProfile = {
      totalPatrimony: form.totalCents / 100,
      state: form.state,
      composition: {
        realEstate: form.realEstateCents / 100,
        investments: form.investmentsCents / 100,
        companies: form.companiesCents / 100,
        privatePension: form.privatePensionCents / 100,
        other: form.otherCents / 100,
      },
      numberOfHeirs: heirs,
      hasSpouse: form.hasSpouse,
      primaryGoal: form.primaryGoal,
    };

    setSubmitting(true);
    try {
      const calcRes = await fetch('/api/calculate-scenarios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!calcRes.ok) {
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
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Seção: Dados gerais */}
        <section>
          <h2 className="text-base font-semibold text-ink">Perfil patrimonial do cliente</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Informe a configuração patrimonial para gerar a análise sucessória comparada.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CurrencyInput
              label="Valor total do patrimônio"
              cents={form.totalCents}
              onChangeCents={(c) => update('totalCents', c)}
              required
            />
            <div>
              <label
                htmlFor="state"
                className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
              >
                Estado do cliente <span className="text-loss" aria-hidden>*</span>
              </label>
              <select
                id="state"
                required
                value={form.state}
                onChange={(e) => update('state', e.target.value as BrazilianState | '')}
                className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm transition hover:border-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Selecione…</option>
                {MVP_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Seção: Composição patrimonial */}
        <section>
          <h2 className="text-base font-semibold text-ink">Composição patrimonial</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Como o patrimônio está distribuído entre as classes de ativo.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <CurrencyInput
              label="Imóveis"
              cents={form.realEstateCents}
              onChangeCents={(c) => update('realEstateCents', c)}
              invalid={compositionInvalid}
            />
            <CurrencyInput
              label="Investimentos"
              cents={form.investmentsCents}
              onChangeCents={(c) => update('investmentsCents', c)}
              invalid={compositionInvalid}
            />
            <CurrencyInput
              label="Empresas / participações"
              cents={form.companiesCents}
              onChangeCents={(c) => update('companiesCents', c)}
              invalid={compositionInvalid}
            />
            <CurrencyInput
              label="Previdência (PGBL/VGBL)"
              cents={form.privatePensionCents}
              onChangeCents={(c) => update('privatePensionCents', c)}
              invalid={compositionInvalid}
            />
            <CurrencyInput
              label="Outros"
              cents={form.otherCents}
              onChangeCents={(c) => update('otherCents', c)}
              invalid={compositionInvalid}
            />
          </div>

          {/* Barra de validação da soma */}
          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className={`h-full transition-all ${
                  composition.total === 0
                    ? 'bg-line'
                    : compositionOk
                      ? 'bg-gain'
                      : 'bg-loss'
                }`}
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Conferência da composição patrimonial"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
              <span className="tabular">
                Soma da composição: <strong className="text-ink">{formatBRL(composition.sum)}</strong>
              </span>
              <span className="tabular">
                {composition.total > 0 ? (
                  compositionOk ? (
                    <span className="text-gain">Composição confere com o total informado.</span>
                  ) : (
                    <span className="text-loss">
                      Diferença: <strong className="tabular">{formatBRL(diff)}</strong>
                      {' '}(tolerância de 1%)
                    </span>
                  )
                ) : (
                  <span>Informe o patrimônio total para conferir.</span>
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Seção: Família e objetivo */}
        <section>
          <h2 className="text-base font-semibold text-ink">Família e objetivo</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Dados que afetam a meação, a partilha e a estratégia recomendada.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="heirs"
                className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
              >
                Número de herdeiros <span className="text-loss" aria-hidden>*</span>
              </label>
              <input
                id="heirs"
                type="number"
                min={1}
                max={20}
                required
                value={form.numberOfHeirs}
                onChange={(e) => update('numberOfHeirs', e.target.value)}
                className={`tabular mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
                  form.numberOfHeirs && !heirsValid ? 'border-loss' : 'border-line hover:border-ink-subtle'
                }`}
              />
            </div>

            <div>
              <span className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Possui cônjuge? <span className="text-loss" aria-hidden>*</span>
              </span>
              <div className="mt-1 inline-flex rounded-md border border-line bg-white p-0.5">
                {([
                  ['Sim', true],
                  ['Não', false],
                ] as const).map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update('hasSpouse', value)}
                    aria-pressed={form.hasSpouse === value}
                    className={`px-4 py-1.5 text-sm rounded transition ${
                      form.hasSpouse === value
                        ? 'bg-accent text-accent-fg'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="goal"
              className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
            >
              Objetivo principal do planejamento <span className="text-loss" aria-hidden>*</span>
            </label>
            <select
              id="goal"
              required
              value={form.primaryGoal}
              onChange={(e) => update('primaryGoal', e.target.value as PlanningGoal | '')}
              className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm transition hover:border-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Selecione…</option>
              {PLANNING_GOALS.map((g) => (
                <option key={g} value={g}>{PLANNING_GOAL_LABELS[g]}</option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-loss/30 bg-red-50 px-4 py-3 text-sm text-loss"
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="block w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Gerando análise…' : 'Gerar análise sucessória'}
          </button>
          <p className="text-xs text-ink-muted">
            Os dados informados não são armazenados em nossos servidores.{' '}
            <a href="#" className="underline underline-offset-2 hover:text-ink">Saiba mais</a>.
          </p>
        </div>
      </form>

      {submitting && <LoadingOverlay />}
    </>
  );
}

function LoadingOverlay(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent"
          aria-hidden
        />
        <p className="text-sm font-medium text-ink">Gerando análise patrimonial…</p>
        <p className="max-w-xs text-center text-xs text-ink-muted">
          Calculando cenários e compondo as considerações para a reunião.
        </p>
      </div>
    </div>
  );
}
