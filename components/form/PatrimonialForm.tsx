'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { ChevronDown, ChevronUp, Loader } from '@/components/ui/Icons';
import type { ClientProfile, OffshoreStructure, MarriageRegime, PlanningGoal, TimeHorizon } from '@/lib/types/client-profile';
import { PLANNING_GOAL_LABELS, OFFSHORE_STRUCTURE_LABELS, MARRIAGE_REGIME_LABELS, MVP_STATES } from '@/lib/types/client-profile';

const STORAGE_KEY = 'patrimonialReportData';
const toReais = (c: number) => c / 100;

type FormState = {
  clientName: string; state: string; marriageRegime: MarriageRegime;
  hasSpouse: boolean; numberOfHeirs: number; primaryGoal: PlanningGoal;
  totalPatrimony: number; realEstate: number; investments: number;
  privatePension: number; companies: number; other: number;
  hasOverseas: boolean; offshoreValue: number; offshoreStructures: OffshoreStructure[];
  hasCrypto: boolean; cryptoValue: number;
  timeHorizon: TimeHorizon; showGrowthRates: boolean;
  fixedIncome: string; variableIncome: string; realEstateRate: string;
  equity: string; offshore: string; crypto: string;
};

const INITIAL: FormState = {
  clientName: '', state: 'SP', marriageRegime: 'comunhao_parcial',
  hasSpouse: true, numberOfHeirs: 2, primaryGoal: 'reduce_tax_burden',
  totalPatrimony: 0, realEstate: 0, investments: 0, privatePension: 0, companies: 0, other: 0,
  hasOverseas: false, offshoreValue: 0, offshoreStructures: [],
  hasCrypto: false, cryptoValue: 0,
  timeHorizon: 10, showGrowthRates: false,
  fixedIncome: '10,5', variableIncome: '12,0', realEstateRate: '6,0',
  equity: '18,0', offshore: '8,0', crypto: '20,0',
};

function Section({ title, badge, open, onToggle, children }: {
  title: string; badge?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-arbor-border overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 bg-arbor-surface hover:bg-arbor-surface2 transition-colors duration-150 cursor-pointer">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-arbor-text">{title}</span>
          {badge && <span className="rounded-full border border-arbor-border px-2 py-0.5 text-xs text-arbor-subtle">{badge}</span>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-arbor-subtle" /> : <ChevronDown className="h-4 w-4 text-arbor-subtle" />}
      </button>
      {open && <div className="px-6 py-5 bg-arbor-bg border-t border-arbor-border space-y-4">{children}</div>}
    </div>
  );
}

function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-arbor-subtle mb-1.5 uppercase tracking-wider">
      {children}{required && <span className="text-arbor-loss ml-1">*</span>}
    </label>
  );
}

function SelectField({ id, value, onChange, children }: { id?: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 px-3 py-2.5 text-sm text-arbor-text focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150 cursor-pointer">
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${checked ? 'bg-arbor-accent' : 'bg-arbor-border'}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-arbor-subtle">{label}</span>
    </label>
  );
}

export default function PatrimonialForm(): JSX.Element {
  const router = useRouter();
  const [f, setF] = useState<FormState>(INITIAL);
  const [open, setOpen] = useState({ id: true, patrimony: true, intl: false, crypto: false, horizon: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upd = (patch: Partial<FormState>) => setF((p) => ({ ...p, ...patch }));
  const tog = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const compositionSum = f.realEstate + f.investments + f.privatePension + f.companies + f.other;
  const compositionOk  = f.totalPatrimony === 0 || Math.abs(compositionSum - f.totalPatrimony) <= Math.max(f.totalPatrimony * 0.01, 100);
  const isValid = f.state && f.numberOfHeirs > 0 && f.totalPatrimony > 0 && compositionOk && f.primaryGoal;

  function parseRate(s: string) { return parseFloat(s.replace(',', '.')) / 100 || 0; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true); setError(null);

    const profile: ClientProfile = {
      clientName:    f.clientName || undefined,
      totalPatrimony: toReais(f.totalPatrimony),
      state:         f.state as ClientProfile['state'],
      marriageRegime: f.marriageRegime,
      composition:   { realEstate: toReais(f.realEstate), investments: toReais(f.investments), privatePension: toReais(f.privatePension), companies: toReais(f.companies), other: toReais(f.other) },
      numberOfHeirs: f.numberOfHeirs,
      hasSpouse:     f.hasSpouse,
      primaryGoal:   f.primaryGoal,
      offshoreAssets: f.hasOverseas && f.offshoreValue > 0 ? { totalValue: toReais(f.offshoreValue), structures: f.offshoreStructures } : undefined,
      cryptoAssets:  f.hasCrypto && f.cryptoValue > 0 ? toReais(f.cryptoValue) : undefined,
      timeHorizon:   f.timeHorizon,
      growthRates:   { fixedIncome: parseRate(f.fixedIncome), variableIncome: parseRate(f.variableIncome), realEstate: parseRate(f.realEstateRate), equity: parseRate(f.equity), offshore: parseRate(f.offshore), crypto: parseRate(f.crypto) },
    };

    try {
      const calcRes = await fetch('/api/calculate-scenarios', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profile) });
      if (!calcRes.ok) throw new Error(`Erro no cálculo: ${calcRes.status}`);
      const calculationResult = await calcRes.json() as unknown;

      const insRes = await fetch('/api/generate-insights', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ profile, calculationResult }) });
      if (!insRes.ok) throw new Error(`Erro nos insights: ${insRes.status}`);
      const insightsResult = await insRes.json() as unknown;

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, calculationResult, insightsResult }));
      router.push('/relatorio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seção 1 — Identificação */}
      <Section title="1 · Identificação" open={open.id} onToggle={() => tog('id')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label htmlFor="clientName">Nome do cliente</Label>
            <input id="clientName" type="text" value={f.clientName} onChange={(e) => upd({ clientName: e.target.value })} placeholder="Para personalizar o relatório" className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 px-3 py-2.5 text-sm text-arbor-text placeholder-arbor-muted focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150" />
          </div>
          <div><Label htmlFor="state" required>Estado de domicílio fiscal</Label>
            <SelectField id="state" value={f.state} onChange={(v) => upd({ state: v })}>
              {MVP_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>
          <div><Label htmlFor="marriageRegime">Regime de casamento</Label>
            <SelectField id="marriageRegime" value={f.marriageRegime} onChange={(v) => upd({ marriageRegime: v as MarriageRegime })}>
              {Object.entries(MARRIAGE_REGIME_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </SelectField>
          </div>
          <div><Label htmlFor="numberOfHeirs" required>Número de herdeiros</Label>
            <input id="numberOfHeirs" type="number" min={0} max={20} value={f.numberOfHeirs} onChange={(e) => upd({ numberOfHeirs: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 px-3 py-2.5 text-sm text-arbor-text focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150" />
          </div>
          <div className="sm:col-span-2"><Label htmlFor="primaryGoal" required>Objetivo principal</Label>
            <SelectField id="primaryGoal" value={f.primaryGoal} onChange={(v) => upd({ primaryGoal: v as PlanningGoal })}>
              {Object.entries(PLANNING_GOAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </SelectField>
          </div>
          <div className="sm:col-span-2"><Toggle checked={f.hasSpouse} onChange={(v) => upd({ hasSpouse: v })} label="Possui cônjuge" /></div>
        </div>
      </Section>

      {/* Seção 2 — Patrimônio */}
      <Section title="2 · Patrimônio Brasil" open={open.patrimony} onToggle={() => tog('patrimony')}>
        <CurrencyInput label="Total do patrimônio Brasil" id="totalPatrimony" value={f.totalPatrimony} onChange={(v) => upd({ totalPatrimony: v })} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput label="Imóveis" id="realEstate" value={f.realEstate} onChange={(v) => upd({ realEstate: v })} />
          <CurrencyInput label="Investimentos financeiros" id="investments" value={f.investments} onChange={(v) => upd({ investments: v })} />
          <CurrencyInput label="Previdência privada (PGBL/VGBL)" id="privatePension" value={f.privatePension} onChange={(v) => upd({ privatePension: v })} tooltip="Isento de ITCMD — STF Tema 1214" />
          <CurrencyInput label="Participações societárias" id="companies" value={f.companies} onChange={(v) => upd({ companies: v })} />
          <CurrencyInput label="Outros ativos" id="other" value={f.other} onChange={(v) => upd({ other: v })} />
        </div>
        {f.totalPatrimony > 0 && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs ${compositionOk ? 'border-arbor-gain/30 bg-arbor-gain/10 text-arbor-gain' : 'border-arbor-loss/30 bg-arbor-loss/10 text-arbor-loss'}`}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${compositionOk ? 'bg-arbor-gain' : 'bg-arbor-loss'}`} />
            {compositionOk ? 'Composição consistente com o total declarado' : `Diferença de R$ ${((Math.abs(compositionSum - f.totalPatrimony)) / 100).toLocaleString('pt-BR')} (tolerância 1%)`}
          </div>
        )}
      </Section>

      {/* Seção 3 — Internacional */}
      <Section title="3 · Estruturas Internacionais" badge="Opcional" open={open.intl} onToggle={() => tog('intl')}>
        <Toggle checked={f.hasOverseas} onChange={(v) => upd({ hasOverseas: v })} label="Possui ativos no exterior" />
        {f.hasOverseas && (
          <div className="space-y-4 pt-2">
            <CurrencyInput label="Valor total estimado no exterior" id="offshoreValue" value={f.offshoreValue} onChange={(v) => upd({ offshoreValue: v })} />
            <div>
              <Label>Tipo de estrutura</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(OFFSHORE_STRUCTURE_LABELS) as [OffshoreStructure, string][]).map(([key, label]) => {
                  const sel = f.offshoreStructures.includes(key);
                  return (
                    <label key={key} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors duration-150 ${sel ? 'border-arbor-accent/50 bg-arbor-accent/10 text-arbor-accent' : 'border-arbor-border text-arbor-subtle hover:border-arbor-muted'}`}>
                      <input type="checkbox" checked={sel} onChange={() => upd({ offshoreStructures: sel ? f.offshoreStructures.filter((s) => s !== key) : [...f.offshoreStructures, key] })} className="sr-only" />
                      <span className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${sel ? 'bg-arbor-accent border-arbor-accent' : 'border-arbor-border'}`}>
                        {sel && <span className="block h-2 w-2 rounded-sm bg-white" />}
                      </span>
                      <span className="text-xs">{label}</span>
                    </label>
                  );
                })}
              </div>
              {f.offshoreStructures.includes('irrevocable_trust') && (
                <p className="mt-2 text-xs text-arbor-gain">Bens em trust irrevogável não integram inventário brasileiro (posição majoritária)</p>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Seção 4 — Cripto */}
      <Section title="4 · Ativos Digitais" badge="Opcional" open={open.crypto} onToggle={() => tog('crypto')}>
        <Toggle checked={f.hasCrypto} onChange={(v) => upd({ hasCrypto: v })} label="Possui criptoativos" />
        {f.hasCrypto && <CurrencyInput label="Valor estimado em criptoativos" id="cryptoValue" value={f.cryptoValue} onChange={(v) => upd({ cryptoValue: v })} tooltip="Herança digital sem planejamento = risco de perda total" />}
      </Section>

      {/* Seção 5 — Horizonte */}
      <Section title="5 · Horizonte de Análise" open={open.horizon} onToggle={() => tog('horizon')}>
        <div>
          <Label>Horizonte temporal</Label>
          <div className="flex flex-wrap gap-2">
            {([0, 5, 10, 20] as TimeHorizon[]).map((yr) => (
              <button key={yr} type="button" onClick={() => upd({ timeHorizon: yr })}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer ${f.timeHorizon === yr ? 'border-arbor-accent bg-arbor-accent/15 text-arbor-accent' : 'border-arbor-border text-arbor-subtle hover:border-arbor-muted'}`}>
                {yr === 0 ? 'Hoje' : `${yr} anos`}
              </button>
            ))}
          </div>
        </div>
        {f.timeHorizon > 0 && (
          <div>
            <button type="button" onClick={() => upd({ showGrowthRates: !f.showGrowthRates })} className="flex items-center gap-2 text-xs text-arbor-subtle hover:text-arbor-text transition-colors duration-150 cursor-pointer">
              {f.showGrowthRates ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Ajustar taxas de crescimento
            </button>
            {f.showGrowthRates && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([ ['Renda fixa', 'fixedIncome'], ['Renda variável', 'variableIncome'], ['Imóveis', 'realEstateRate'], ['Participações/VC', 'equity'], ['Offshore', 'offshore'], ['Criptoativos', 'crypto'] ] as [string, string][]).map(([lbl, key]) => (
                  <div key={key}>
                    <Label>{lbl}</Label>
                    <div className="relative">
                      <input type="text" value={f[key as keyof FormState] as string} onChange={(e) => upd({ [key]: e.target.value } as Partial<FormState>)} className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 pr-8 pl-3 py-2 text-sm text-arbor-text focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-arbor-muted">% a.a.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {error && (
        <div className="rounded-lg border border-arbor-loss/30 bg-arbor-loss/10 px-4 py-3 text-sm text-arbor-loss flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs underline cursor-pointer ml-4">Fechar</button>
        </div>
      )}

      <button type="submit" disabled={!isValid || loading}
        className="w-full rounded-lg bg-arbor-accent py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
        {loading && <Loader className="h-4 w-4" />}
        {loading ? 'Gerando análise…' : 'Gerar análise sucessória'}
      </button>

      <p className="text-center text-xs text-arbor-muted px-4">
        Os dados inseridos não são armazenados em nossos servidores. Processados localmente para geração da análise.
      </p>
    </form>
  );
}
