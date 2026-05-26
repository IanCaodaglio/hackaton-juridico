import ReportCard from '@/components/ui/ReportCard';
import type { CalculationResult, ScenarioName } from '@/lib/types/calculation-result';
import { formatBRL, formatBRLCompact } from '@/lib/format';

type Props = { calculationResult: CalculationResult };

const SCENARIO_DISPLAY: Record<ScenarioName, string> = {
  no_planning:            'Sem planejamento',
  donation_plus_offshore: 'Doação em vida + offshore',
  holding_plus_trust:     'Holding + trust irrevogável',
};

export default function Block2ScenarioComparison({ calculationResult }: Props): JSX.Element {
  const { scenarios, recommendedScenario, savingsVsNoPlanning } = calculationResult;
  const maxToHeirs = Math.max(...scenarios.map((s) => s.breakdown.toHeirs));

  return (
    <ReportCard number="02" title="Comparativo de Cenários">
      {savingsVsNoPlanning > 0 && (
        <div className="mb-5 rounded-lg border border-arbor-gain/30 bg-arbor-gain/10 px-4 py-3">
          <p className="text-xs text-arbor-gain font-medium">Economia estimada com o melhor cenário</p>
          <p className="font-serif text-2xl font-semibold text-arbor-gain tabular">{formatBRLCompact(savingsVsNoPlanning)}</p>
          <p className="text-xs text-arbor-subtle mt-0.5">vs. transmissão sem estruturação</p>
        </div>
      )}

      <div className="space-y-4">
        {scenarios.map((scenario) => {
          const isRecommended = scenario.name === recommendedScenario;
          const pct = (scenario.breakdown.toHeirs / maxToHeirs) * 100;
          return (
            <div key={scenario.name} className={`rounded-xl border p-4 ${isRecommended ? 'border-arbor-gain/40 bg-arbor-gain/5' : 'border-arbor-border bg-arbor-surface2'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-arbor-text">{SCENARIO_DISPLAY[scenario.name]}</span>
                {isRecommended && (
                  <span className="rounded-full border border-arbor-gain/40 bg-arbor-gain/20 px-2 py-0.5 text-xs text-arbor-gain">Melhor cenário</span>
                )}
              </div>
              {/* Mini stacked bar */}
              <div className="mb-3 h-2 w-full rounded-full bg-arbor-surface overflow-hidden">
                <div className="h-full rounded-full bg-arbor-gain transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-arbor-subtle">Para herdeiros</p>
                  <p className="font-semibold text-arbor-gain tabular">{formatBRL(scenario.breakdown.toHeirs)}</p>
                </div>
                <div>
                  <p className="text-arbor-subtle">ITCMD</p>
                  <p className="font-semibold text-arbor-loss tabular">{formatBRL(scenario.breakdown.itcmdLoss)}</p>
                </div>
                <div>
                  <p className="text-arbor-subtle">Inventário/custos</p>
                  <p className="font-semibold text-arbor-warn tabular">{formatBRL(scenario.breakdown.inventoryCost)}</p>
                </div>
                <div>
                  <p className="text-arbor-subtle">IR</p>
                  <p className="font-semibold text-arbor-text tabular">{formatBRL(scenario.breakdown.incomeTaxOnInvestments)}</p>
                </div>
              </div>
              {scenario.caveats.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {scenario.caveats.map((c) => (
                    <li key={c} className="flex items-start gap-1.5 text-xs text-arbor-subtle">
                      <span className="mt-1 h-1 w-1 rounded-full bg-arbor-muted flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}
