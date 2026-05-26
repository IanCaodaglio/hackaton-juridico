import ReportCard from '@/components/ui/ReportCard';
import type { CalculationResult } from '@/lib/types/calculation-result';
import { formatBRL, formatPercent } from '@/lib/format';

type Props = { calculationResult: CalculationResult };

export default function Block1PatrimonialThermometer({ calculationResult }: Props): JSX.Element {
  const noPlanning = calculationResult.scenarios.find((s) => s.name === 'no_planning');
  if (!noPlanning) return <></>;
  const { breakdown: bd } = noPlanning;
  const total = bd.total;
  const bars = [
    { label: 'Herdeiros',  value: bd.toHeirs,               color: 'bg-arbor-gain' },
    { label: 'ITCMD',      value: bd.itcmdLoss,              color: 'bg-arbor-loss' },
    { label: 'Inventário', value: bd.inventoryCost,          color: 'bg-arbor-warn' },
    { label: 'IR',         value: bd.incomeTaxOnInvestments, color: 'bg-orange-500' },
  ].filter((b) => b.value > 0);

  return (
    <ReportCard number="01" title="Termômetro Patrimonial">
      <p className="text-xs text-arbor-subtle mb-5">
        Cenário base sem planejamento. Total: <span className="text-arbor-text font-medium tabular">{formatBRL(total)}</span>
      </p>
      <div className="mb-5 overflow-hidden rounded-lg flex h-10">
        {bars.map((b) => (
          <div key={b.label} className={`${b.color} transition-all duration-500`} style={{ width: `${(b.value / total) * 100}%` }} title={`${b.label}: ${formatBRL(b.value)}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {bars.map((b) => (
          <div key={b.label} className="flex items-start gap-2">
            <span className={`mt-0.5 h-3 w-3 rounded-sm flex-shrink-0 ${b.color}`} />
            <div>
              <p className="text-xs text-arbor-subtle">{b.label}</p>
              <p className="text-sm font-medium text-arbor-text tabular">{formatBRL(b.value)}</p>
              <p className="text-xs text-arbor-muted tabular">{formatPercent(b.value / total)}</p>
            </div>
          </div>
        ))}
      </div>
      {calculationResult.projectedAt8pct && calculationResult.projectedAt8pct.delta > 0 && (
        <div className="mt-5 rounded-lg border border-arbor-warn/30 bg-arbor-warn/10 px-4 py-3">
          <p className="text-xs text-arbor-warn font-medium mb-0.5">Cenário com alíquota máxima (8%)</p>
          <p className="text-xs text-arbor-subtle">
            ITCMD atual estimado: <span className="text-arbor-text tabular">{formatBRL(calculationResult.projectedAt8pct.current)}</span>{' '}
            → com 8%: <span className="text-arbor-loss font-medium tabular">{formatBRL(calculationResult.projectedAt8pct.projected)}</span>{' '}
            (delta: <span className="tabular">{formatBRL(calculationResult.projectedAt8pct.delta)}</span>)
          </p>
        </div>
      )}
      <p className="mt-4 text-xs text-arbor-muted italic">{calculationResult.calculationDisclaimer}</p>
    </ReportCard>
  );
}
