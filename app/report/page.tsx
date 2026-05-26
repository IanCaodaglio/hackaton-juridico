'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Block1PatrimonialThermometer from '@/components/report/Block1_PatrimonialThermometer';
import Block2ScenarioComparison from '@/components/report/Block2_ScenarioComparison';
import Block3TaxWindowAlert from '@/components/report/Block3_TaxWindowAlert';
import Block4NextSteps from '@/components/report/Block4_NextSteps';
import { LGPD_NOTICE, NOT_LEGAL_ADVICE_NOTICE } from '@/lib/disclaimers';
import type { ClientProfile } from '@/lib/types/client-profile';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { InsightsResult } from '@/lib/types/insights-result';

const STORAGE_KEY = 'patrimonialReportData';

type ReportData = {
  profile: ClientProfile;
  calculationResult: CalculationResult;
  insightsResult: InsightsResult;
};

export default function ReportPage(): JSX.Element {
  const [data, setData] = useState<ReportData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      // TODO(etapa 2): validar shape com type guards antes de confiar.
      // Por ora aceitamos como ReportData — origem é a própria página, mas
      // sessionStorage pode ser manipulado pelo usuário.
      const parsed = JSON.parse(raw) as ReportData;
      setData(parsed);
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm">
          Nenhum relatório carregado.{' '}
          <Link href="/" className="underline">Voltar ao formulário</Link>.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-neutral-600">Carregando relatório…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Relatório de Planejamento</h1>
        <Link href="/" className="text-sm underline">Novo perfil</Link>
      </header>

      <div className="mb-8 rounded border-2 border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="mb-1 block uppercase tracking-wide">
          Aviso Importante
        </strong>
        {NOT_LEGAL_ADVICE_NOTICE}
      </div>

      <div className="space-y-6">
        <Block1PatrimonialThermometer calculationResult={data.calculationResult} />
        <Block2ScenarioComparison calculationResult={data.calculationResult} />
        <Block3TaxWindowAlert insightsResult={data.insightsResult} />
        <Block4NextSteps insightsResult={data.insightsResult} />
      </div>

      <footer className="mt-12 border-t pt-6 text-xs text-neutral-500">
        {LGPD_NOTICE}
      </footer>
    </main>
  );
}
