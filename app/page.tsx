import PatrimonialForm from '@/components/form/PatrimonialForm';

export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen">
      {/* Header institucional */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif-display text-xl font-semibold tracking-tight">
              Sucessio
            </span>
            <span className="text-xs uppercase tracking-widest text-ink-subtle">
              Planejamento patrimonial e sucessório
            </span>
          </div>
          <span className="hidden text-xs text-ink-muted sm:block">
            Ferramenta de apoio para profissionais habilitados
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-10">
          <h1 className="font-serif-display text-3xl font-semibold text-ink">
            Nova análise sucessória
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Preencha o perfil patrimonial do cliente para gerar o relatório
            comparativo de cenários, com janela tributária e tópicos para
            discussão.
          </p>
        </div>

        <PatrimonialForm />
      </main>
    </div>
  );
}
