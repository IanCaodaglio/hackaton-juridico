import PatrimonialForm from '@/components/form/PatrimonialForm';
import { LGPD_NOTICE, NOT_LEGAL_ADVICE_NOTICE } from '@/lib/disclaimers';

export default function HomePage(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Planejamento Patrimonial e Sucessório</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Ferramenta de apoio para profissionais de wealth management e advisors
          financeiros. Preencha o perfil patrimonial do cliente para gerar o
          relatório de reunião.
        </p>
      </header>

      <div className="mb-8 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block">Aviso</strong>
        {NOT_LEGAL_ADVICE_NOTICE}
      </div>

      <PatrimonialForm />

      <footer className="mt-12 border-t pt-6 text-xs text-neutral-500">
        {LGPD_NOTICE}
      </footer>
    </main>
  );
}
