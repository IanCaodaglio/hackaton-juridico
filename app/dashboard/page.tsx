'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TREND_CARDS = [
  { label: 'Trusts constituídos no Brasil — Q1 2026', value: '1.247', delta: '+18% vs Q4 2025', positive: true },
  { label: 'Holdings familiares abertas em 2025', value: '34.891', delta: '+23% vs 2024', positive: true },
  { label: 'Patrimônio em estruturas offshore declaradas (CBE 2025)', value: 'R$ 1,2 tri', delta: '', positive: null },
  { label: 'Tempo médio de inventário judicial — SP', value: '38 meses', delta: '↓ vs 42 meses (2023)', positive: true },
  { label: 'Tempo médio de inventário extrajudicial', value: '8 meses', delta: '4,75x mais rápido', positive: true },
  { label: 'Penetração de planejamento sucessório (patrimônio > R$ 5mi)', value: '12%', delta: 'Oportunidade latente', positive: null },
];

type ItcmdState = {
  uf: string;
  name: string;
  rate: number;
  status: string;
};

const ITCMD_DATA: ItcmdState[] = [
  { uf: 'SP', name: 'São Paulo',        rate: 4,   status: 'PL 409/2025 em tramitação (até 8%)' },
  { uf: 'RJ', name: 'Rio de Janeiro',   rate: 8,   status: 'Progressivo 4%–8% — em vigor' },
  { uf: 'MG', name: 'Minas Gerais',     rate: 5,   status: 'Flat 5%' },
  { uf: 'RS', name: 'Rio Grande do Sul',rate: 6,   status: 'Progressivo 3%–6%' },
  { uf: 'PR', name: 'Paraná',           rate: 4,   status: 'PL 730/2024 em tramitação (até 8%)' },
  { uf: 'SC', name: 'Santa Catarina',   rate: 1,   status: 'Flat 1% — menor do país' },
  { uf: 'DF', name: 'Distrito Federal', rate: 4,   status: 'Flat 4%' },
  { uf: 'BA', name: 'Bahia',            rate: 4,   status: 'Progressivo até 4%' },
  { uf: 'GO', name: 'Goiás',            rate: 4,   status: 'Progressivo 2%–4%' },
  { uf: 'MT', name: 'Mato Grosso',      rate: 8,   status: 'Progressivo até 8%' },
  { uf: 'MS', name: 'Mato Grosso do Sul',rate:6,   status: 'Flat 6%' },
  { uf: 'CE', name: 'Ceará',            rate: 8,   status: 'Progressivo 2%–8%' },
  { uf: 'PE', name: 'Pernambuco',       rate: 8,   status: 'Progressivo 2%–8%' },
  { uf: 'PA', name: 'Pará',             rate: 2,   status: 'Flat 2%' },
  { uf: 'AM', name: 'Amazonas',         rate: 2,   status: 'Flat 2%' },
  { uf: 'ES', name: 'Espírito Santo',   rate: 4,   status: 'Flat 4%' },
  { uf: 'MA', name: 'Maranhão',         rate: 4,   status: 'Progressivo 1%–4%' },
  { uf: 'PB', name: 'Paraíba',          rate: 2,   status: 'Flat 2%' },
  { uf: 'RN', name: 'Rio Grande do Norte',rate:3,  status: 'Flat 3%' },
  { uf: 'AL', name: 'Alagoas',          rate: 4,   status: 'Progressivo 2%–4%' },
  { uf: 'SE', name: 'Sergipe',          rate: 8,   status: 'Progressivo 1%–8%' },
  { uf: 'PI', name: 'Piauí',            rate: 4,   status: 'Progressivo 2%–4%' },
  { uf: 'TO', name: 'Tocantins',        rate: 2,   status: 'Flat 2%' },
  { uf: 'RO', name: 'Rondônia',         rate: 4,   status: 'Flat 4%' },
  { uf: 'AC', name: 'Acre',             rate: 4,   status: 'Flat 4%' },
  { uf: 'AP', name: 'Amapá',            rate: 2,   status: 'Progressivo 1%–2%' },
  { uf: 'RR', name: 'Roraima',          rate: 4,   status: 'Flat 4%' },
];

function rateColor(rate: number): string {
  if (rate <= 4) return 'border-arbor-gain/40 bg-arbor-gain/10 text-arbor-gain';
  if (rate === 5) return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';
  if (rate <= 7) return 'border-orange-500/40 bg-orange-500/10 text-orange-400';
  return 'border-arbor-loss/40 bg-arbor-loss/10 text-arbor-loss';
}

const LEGISLATION = [
  { label: 'EC 132/2023 — Progressividade obrigatória do ITCMD', badge: 'Em vigor', color: 'bg-arbor-gain/20 text-arbor-gain border-arbor-gain/30' },
  { label: 'SP — PL 409/2025 (ALESP) — Alíquotas progressivas até 8%', badge: 'Em tramitação', color: 'bg-arbor-warn/20 text-arbor-warn border-arbor-warn/30' },
  { label: 'PR — PL 730/2024 (ALEP) — Alíquotas 2% a 8%', badge: 'Em tramitação', color: 'bg-arbor-warn/20 text-arbor-warn border-arbor-warn/30' },
  { label: 'Lei 14.754/2023 — Tributação de offshores e trusts', badge: 'Em vigor desde jan/2024', color: 'bg-arbor-gain/20 text-arbor-gain border-arbor-gain/30' },
  { label: 'STF Tema 1214 — VGBL/PGBL isentos de ITCMD', badge: 'Decidido jan/2025', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];

const BENCHMARK_DATA = [
  { name: 'Sem planejamento', pct: 71, fill: '#EF4444' },
  { name: 'Doação em vida',   pct: 83, fill: '#F59E0B' },
  { name: 'Holding + Trust',  pct: 91, fill: '#22C55E' },
];

export default function DashboardPage(): JSX.Element {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-arbor-text">
            Dashboard de Mercado · Wealth &amp; Sucessão Brasil
          </h1>
          <p className="text-sm text-arbor-subtle mt-1">{today}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-arbor-warn/40 bg-arbor-warn/10 px-3 py-1 text-xs text-arbor-warn">
          <span className="h-1.5 w-1.5 rounded-full bg-arbor-warn" />
          Dados ilustrativos — versão demo
        </span>
      </div>

      {/* Bloco A — Tendências */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-arbor-subtle mb-4">
          A · Tendências Estruturais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TREND_CARDS.map((c) => (
            <div key={c.label} className="rounded-xl border border-arbor-border bg-arbor-surface p-5">
              <p className="text-xs text-arbor-subtle leading-relaxed mb-3">{c.label}</p>
              <p className="font-serif text-2xl font-semibold text-arbor-text tabular">{c.value}</p>
              {c.delta && (
                <p className={`text-xs mt-1 ${c.positive === true ? 'text-arbor-gain' : c.positive === false ? 'text-arbor-loss' : 'text-arbor-subtle'}`}>
                  {c.delta}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bloco B — Mapa ITCMD */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-widest text-arbor-subtle">
            B · Alíquota Máxima ITCMD por Estado
          </h2>
          <div className="hidden sm:flex items-center gap-4 text-xs text-arbor-subtle">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-arbor-gain/60" />≤ 4%</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-yellow-500/60" />5%</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-orange-500/60" />6–7%</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-arbor-loss/60" />≥ 8%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {ITCMD_DATA.map((s) => (
            <div
              key={s.uf}
              title={`${s.name}: ${s.status}`}
              className={`rounded-lg border p-3 cursor-default transition-all duration-150 hover:scale-105 ${rateColor(s.rate)}`}
            >
              <p className="font-mono text-sm font-bold">{s.uf}</p>
              <p className="text-xs opacity-75 truncate">{s.name}</p>
              <p className="font-semibold text-base mt-1">{s.rate}%</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bloco C — Indicadores legislativos */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-arbor-subtle mb-4">
          C · Indicadores Tributários
        </h2>
        <div className="rounded-xl border border-arbor-border bg-arbor-surface overflow-hidden">
          {LEGISLATION.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-4 px-6 py-4 text-sm ${i < LEGISLATION.length - 1 ? 'border-b border-arbor-border' : ''}`}
            >
              <span className="text-arbor-subtle">{item.label}</span>
              <span className={`flex-shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium ${item.color}`}>
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bloco D — Benchmark */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-arbor-subtle mb-1">
          D · Benchmark — Preservação Patrimonial por Cenário
        </h2>
        <p className="text-xs text-arbor-muted mb-5">
          Percentual médio do patrimônio preservado pelos herdeiros. Base: simulações demonstrativas.
        </p>
        <div className="rounded-xl border border-arbor-border bg-arbor-surface p-6">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BENCHMARK_DATA} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[60, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Patrimônio preservado']}
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#F8FAFC' }}
                itemStyle={{ color: '#94A3B8' }}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {BENCHMARK_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-arbor-muted mt-3 text-center">
            Dados reais disponíveis após adoção da plataforma.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-center pb-4">
        <Link
          href="/simulacao"
          className="rounded-lg bg-arbor-accent px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity duration-150 cursor-pointer"
        >
          Iniciar nova simulação
        </Link>
      </div>
    </main>
  );
}
