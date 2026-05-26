import type { InsightsResult } from '@/lib/types/insights-result';
import { LLM_DISCLAIMER } from '@/lib/disclaimers';

type Props = {
  insightsResult: InsightsResult;
};

// Nome de UI: "Pontos para discussão" (NÃO "recomendações" / "próximos passos
// recomendados"). Ver compliance jurídico no README do projeto.
export default function Block4NextSteps(props: Props): JSX.Element {
  return (
    <section className="rounded border bg-neutral-50 p-6">
      <h2 className="text-xl font-semibold">Bloco 4 — Pontos para Discussão</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Placeholder. Implementação visual virá do Claude Design.
      </p>
      <pre className="mt-4 max-h-64 overflow-auto rounded bg-white p-2 text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
      <p className="mt-4 text-xs text-neutral-500">{LLM_DISCLAIMER}</p>
    </section>
  );
}
