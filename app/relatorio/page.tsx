'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Block1PatrimonialThermometer from '@/components/report/Block1_PatrimonialThermometer';
import Block2ScenarioComparison from '@/components/report/Block2_ScenarioComparison';
import Block3TaxWindowAlert from '@/components/report/Block3_TaxWindowAlert';
import Block4NextSteps from '@/components/report/Block4_NextSteps';
import { NOT_LEGAL_ADVICE_NOTICE } from '@/lib/disclaimers';
import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

const STORAGE_KEY = 'patrimonialReportData';

type PartialReportData = {
  profile:           ClientProfile;
  calculationResult: CalculationResult;
  insightsResult?:   InsightsResult;   // chega de forma assíncrona
};

function isPartialReportData(v: unknown): v is PartialReportData {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r['profile'] === 'object' && r['profile'] !== null &&
    typeof r['calculationResult'] === 'object' && r['calculationResult'] !== null &&
    Array.isArray((r['calculationResult'] as Record<string, unknown>)['scenarios'])
  );
}

function isInsightsResult(v: unknown): v is InsightsResult {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r['taxWindow'] === 'object' && r['taxWindow'] !== null &&
    Array.isArray(r['topicsToDiscuss']) &&
    typeof r['generatedAt'] === 'string'
  );
}

function BlockSkeleton({ height }: { height: number }) {
  return <div className="skeleton rounded-xl" style={{ height }} />;
}

function FullSkeleton() {
  return (
    <div className="space-y-6">
      {[240, 320, 200, 280].map((h) => (
        <div key={h} className="skeleton rounded-xl" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function RelatorioPage(): JSX.Element {
  const [data, setData] = useState<PartialReportData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) { setMissing(true); return; }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isPartialReportData(parsed)) { setMissing(true); return; }

      setData(parsed);

      // Se insights já presentes (ex: usuário voltou à página), não re-buscar
      if (parsed.insightsResult) return;

      // Buscar insights em background — Blocos 1 e 2 já estão visíveis
      setInsightsLoading(true);
      fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          profile:           parsed.profile,
          calculationResult: parsed.calculationResult,
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`insights ${r.status}`))))
        .then((result: unknown) => {
          if (isInsightsResult(result)) {
            setData((prev) => prev ? { ...prev, insightsResult: result } : prev);
          }
        })
        .catch((err: unknown) => console.error('[relatorio] insights:', err instanceof Error ? err.message : err))
        .finally(() => setInsightsLoading(false));
    } catch {
      setMissing(true);
    }
  }, []);

  const generatedAt = data?.insightsResult
    ? new Date(data.insightsResult.generatedAt).toLocaleString('pt-BR')
    : '';
  const clientName = data?.profile.clientName;
  const state      = data?.profile.state ?? '';
  const horizon    = data?.profile.timeHorizon;

  if (missing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm text-arbor-subtle mb-4">Nenhum relatório carregado.</p>
        <Link href="/simulacao" className="rounded-lg bg-arbor-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity duration-150 cursor-pointer">
          Nova simulação
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <FullSkeleton />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Header do relatório */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl font-semibold text-arbor-text">
            Análise Patrimonial{clientName ? ` · ${clientName}` : ''} · {state}
          </h1>
          <p className="text-xs text-arbor-subtle mt-1">
            {generatedAt
              ? `Gerado em ${generatedAt}`
              : insightsLoading
              ? 'Gerando análise qualitativa…'
              : 'Análise gerada'}
            {horizon !== undefined ? ` · Horizonte: ${horizon === 0 ? 'hoje' : `${horizon} anos`}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-arbor-border px-4 py-2 text-xs text-arbor-subtle hover:text-arbor-text hover:border-arbor-muted transition-colors duration-150 cursor-pointer"
          >
            Exportar PDF
          </button>
          <Link href="/simulacao" className="rounded-lg bg-arbor-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity duration-150 cursor-pointer">
            Nova simulação
          </Link>
        </div>
      </div>

      {/* Banner jurídico — obrigatório e visível */}
      <div className="mb-6 rounded-xl border border-arbor-warn/40 bg-arbor-warn/10 px-5 py-3 text-sm text-arbor-warn">
        <strong className="font-medium">Aviso</strong> — {NOT_LEGAL_ADVICE_NOTICE}
      </div>

      {/* Blocos 1 e 2 — disponíveis imediatamente (cálculo síncrono) */}
      <div className="space-y-6">
        <Block1PatrimonialThermometer calculationResult={data.calculationResult} />
        <Block2ScenarioComparison    calculationResult={data.calculationResult} />

        {/* Blocos 3 e 4 — aguardam resposta do LLM */}
        {insightsLoading ? (
          <>
            <BlockSkeleton height={200} />
            <BlockSkeleton height={280} />
          </>
        ) : data.insightsResult ? (
          <>
            <Block3TaxWindowAlert insightsResult={data.insightsResult} />
            <Block4NextSteps      insightsResult={data.insightsResult} />
          </>
        ) : (
          <div className="rounded-xl border border-arbor-border bg-arbor-surface px-6 py-5 text-sm text-arbor-subtle">
            Análise qualitativa indisponível. Verifique a configuração da chave de API.
          </div>
        )}
      </div>
    </main>
  );
}
