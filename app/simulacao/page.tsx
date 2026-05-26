import PatrimonialForm from '@/components/form/PatrimonialForm';

export default function SimulacaoPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-arbor-text">
          Nova Simulação Patrimonial
        </h1>
        <p className="mt-2 text-sm text-arbor-subtle">
          Preencha o perfil do cliente para gerar a análise sucessória.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-arbor-warn/30 bg-arbor-warn/10 px-5 py-3 text-sm text-arbor-warn">
        <strong className="font-medium">Aviso</strong>
        {' '}— Esta ferramenta é instrumento de apoio exclusivo para profissionais habilitados em planejamento patrimonial. Não constitui consultoria jurídica, fiscal ou financeira.
      </div>

      <PatrimonialForm />
    </main>
  );
}
