'use client';

import { useState } from 'react';
import type { CalculationResult } from '@/lib/types/calculation-result';
import type { ClientProfile } from '@/lib/types/client-profile';
import { formatBRL, formatPercent, formatBRLCompact } from '@/lib/format';
import { getFakeItcmdRate } from '@/lib/calculations/fake-scenarios';
import ReportCard from '@/components/ui/ReportCard';

type Props = {
  calculationResult: CalculationResult;
  profile: ClientProfile;
};

type SegmentKey = 'toHeirs' | 'itcmdLoss' | 'inventoryCost' | 'incomeTaxOnInvestments';

type Segment = {
  key: SegmentKey;
  label: string;
  value: number;
  pct: number;
  colorClass: string;
  swatchClass: string;
  explanation: string;
};

export default function Block1PatrimonialThermometer({
  calculationResult,
  profile,
}: Props): JSX.Element {
  const [hovered, setHovered] = useState<SegmentKey | null>(null);
  const noPlanning = calculationResult.scenarios.find((s) => s.name === 'no_planning');
  if (!noPlanning) return <></>;

  const total = noPlanning.breakdown.total || 1;
  const itcmdRate = getFakeItcmdRate(profile.state);

  const segments: Segment[] = [
    {
      key: 'toHeirs',
      label: 'Aos herdeiros',
      value: noPlanning.breakdown.toHeirs,
      pct: (noPlanning.breakdown.toHeirs / total) * 100,
      colorClass: 'bg-accent',
      swatchClass: 'bg-accent',
      explanation: 'Valor líquido que efetivamente chega aos herdeiros após tributos e custos.',
    },
    {
      key: 'itcmdLoss',
      label: 'ITCMD',
      value: noPlanning.breakdown.itcmdLoss,
      pct: (noPlanning.breakdown.itcmdLoss / total) * 100,
      colorClass: 'bg-loss',
      swatchClass: 'bg-loss',
      explanation: `Imposto estadual sobre transmissão. Alíquota referencial de ${profile.state}: ${formatPercent(itcmdRate)}.`,
    },
    {
      key: 'inventoryCost',
      label: 'Custos de inventário',
      value: noPlanning.breakdown.inventoryCost,
      pct: (noPlanning.breakdown.inventoryCost / total) * 100,
      colorClass: 'bg-red-400',
      swatchClass: 'bg-red-400',
      explanation: 'Custas judiciais e honorários advocatícios estimados para o processo de inventário.',
    },
    {
      key: 'incomeTaxOnInvestments',
      label: 'IR sobre investimentos',
      value: noPlanning.breakdown.incomeTaxOnInvestments,
      pct: (noPlanning.breakdown.incomeTaxOnInvestments / total) * 100,
      colorClass: 'bg-red-300',
      swatchClass: 'bg-red-300',
      explanation: 'Imposto de renda sobre ganhos não realizados na transferência dos investimentos.',
    },
  ];

  return (
    <ReportCard number="01" title="Termômetro patrimonial">
      <p className="font-serif-display text-2xl leading-snug text-ink">
        Sem planejamento, os herdeiros recebem aproximadamente{' '}
        <span className="font-semibold text-accent">
          {formatBRLCompact(noPlanning.breakdown.toHeirs)}
        </span>{' '}
        de um patrimônio de{' '}
        <span className="font-semibold">{formatBRLCompact(noPlanning.breakdown.total)}</span>.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Barra empilhada */}
        <div>
          <div
            className="relative flex h-12 w-full overflow-hidden rounded-md ring-1 ring-line"
            role="img"
            aria-label="Distribuição do patrimônio: aos herdeiros, ITCMD, custos de inventário, IR"
          >
            {segments.map((seg) => (
              <div
                key={seg.key}
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(seg.key)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${seg.label}: ${formatBRL(seg.value, false)}, ${formatPercent(seg.pct / 100)}`}
                style={{ width: `${seg.pct}%` }}
                className={`relative h-full transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${seg.colorClass} ${
                  hovered && hovered !== seg.key ? 'opacity-60' : ''
                }`}
              />
            ))}
          </div>

          {/* Tooltip (segmento hovered) */}
          <div className="mt-3 min-h-[56px] rounded-md border border-line bg-white px-4 py-3 text-sm">
            {hovered ? (
              (() => {
                const seg = segments.find((s) => s.key === hovered)!;
                return (
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-3 w-3 rounded-sm ${seg.swatchClass}`} aria-hidden />
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <strong className="text-ink">{seg.label}</strong>
                        <span className="tabular text-ink-muted">
                          {formatBRL(seg.value)} · {formatPercent(seg.pct / 100)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">{seg.explanation}</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-ink-muted">
                Passe o mouse sobre um segmento da barra para ver detalhes.
              </p>
            )}
          </div>
        </div>

        {/* Legenda tabular */}
        <div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-muted">
              <tr className="border-b border-line">
                <th className="pb-2 text-left font-medium">Componente</th>
                <th className="pb-2 text-right font-medium">Valor</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => (
                <tr
                  key={seg.key}
                  className="border-b border-line/60 last:border-0"
                  onMouseEnter={() => setHovered(seg.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <td className="py-2">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-sm ${seg.swatchClass}`} aria-hidden />
                      <span className={seg.key === 'toHeirs' ? 'font-medium text-ink' : 'text-ink-muted'}>
                        {seg.label}
                      </span>
                    </span>
                  </td>
                  <td className="tabular py-2 text-right text-ink">{formatBRL(seg.value, false)}</td>
                  <td className="tabular py-2 text-right text-ink-muted">
                    {formatPercent(seg.pct / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Cálculo estimativo baseado em alíquotas referenciais. PGBL/VGBL excluídos
        da base do ITCMD conforme STF Tema 1214.
      </p>
    </ReportCard>
  );
}

