import type { CalculationResult, Scenario } from '@/lib/types/calculation-result';
import { formatBRL } from '@/lib/format';
import ReportCard from '@/components/ui/ReportCard';

type Props = {
  calculationResult: CalculationResult;
};

const ROWS: {
  key: keyof Scenario['breakdown'] | 'savings';
  label: string;
  emphasize?: boolean;
}[] = [
  { key: 'total', label: 'Patrimônio bruto' },
  { key: 'itcmdLoss', label: 'ITCMD' },
  { key: 'inventoryCost', label: 'Custos de inventário' },
  { key: 'incomeTaxOnInvestments', label: 'IR sobre investimentos' },
  { key: 'toHeirs', label: 'Aos herdeiros', emphasize: true },
  { key: 'savings', label: 'Economia vs. sem planejamento' },
];

export default function Block2ScenarioComparison({ calculationResult }: Props): JSX.Element {
  const { scenarios, recommendedScenario } = calculationResult;
  const baseline = scenarios.find((s) => s.name === 'no_planning');
  const baselineToHeirs = baseline?.breakdown.toHeirs ?? 0;

  function getCell(s: Scenario, row: (typeof ROWS)[number]): JSX.Element {
    if (row.key === 'savings') {
      const savings = s.breakdown.toHeirs - baselineToHeirs;
      if (s.name === 'no_planning') {
        return <span className="text-ink-subtle">—</span>;
      }
      return (
        <span className={savings > 0 ? 'text-gain' : 'text-ink-muted'}>
          {savings > 0 ? '+' : ''}
          {formatBRL(savings, false)}
        </span>
      );
    }
    const v = s.breakdown[row.key];
    return <span>{formatBRL(v, false)}</span>;
  }

  return (
    <ReportCard number="02" title="Comparativo de cenários">
      <p className="text-sm text-ink-muted">
        Comparativo entre três estruturas de planejamento. Valores estimados a
        partir das alíquotas e premissas indicadas.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                Componente
              </th>
              {scenarios.map((s) => {
                const isRecommended = s.name === recommendedScenario;
                return (
                  <th
                    key={s.name}
                    scope="col"
                    className={`py-3 text-right text-xs font-medium uppercase tracking-wide ${
                      isRecommended ? 'text-accent' : 'text-ink-muted'
                    }`}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>{s.displayName}</span>
                      {isRecommended && (
                        <span className="rounded-sm border border-accent/30 bg-accent/5 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-accent">
                          Sugerido para análise
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.key}
                className={`border-b border-line/60 last:border-0 ${
                  row.emphasize ? 'bg-canvas/60' : ''
                }`}
              >
                <th
                  scope="row"
                  className={`py-3 text-left font-normal ${
                    row.emphasize ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {row.emphasize ? <strong>{row.label}</strong> : row.label}
                </th>
                {scenarios.map((s) => {
                  const isRecommended = s.name === recommendedScenario;
                  return (
                    <td
                      key={s.name}
                      className={`tabular py-3 text-right ${
                        row.emphasize
                          ? `text-base ${isRecommended ? 'font-semibold text-accent' : 'font-semibold text-ink'}`
                          : 'text-ink'
                      } ${isRecommended && !row.emphasize ? 'bg-accent/[0.02]' : ''}`}
                    >
                      {getCell(s, row)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Caveats por cenário */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => {
          const isRecommended = s.name === recommendedScenario;
          return (
            <div
              key={s.name}
              className={`rounded-md border p-4 text-xs ${
                isRecommended ? 'border-accent/30 bg-accent/[0.03]' : 'border-line bg-white'
              }`}
            >
              <h3 className="text-sm font-semibold text-ink">{s.displayName}</h3>
              <ul className="mt-2 space-y-1.5 text-ink-muted">
                {s.caveats.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-subtle" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Os valores são estimativas. A escolha do cenário depende de fatores não
        capturados nesta análise (relações familiares, liquidez, objetivos não
        tributários).
      </p>
    </ReportCard>
  );
}
