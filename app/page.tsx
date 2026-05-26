'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Autenticação fake — redireciona para o dashboard
    setTimeout(() => router.push('/dashboard'), 600);
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-stretch">
      {/* Formulário — lado esquerdo */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-3/5 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-serif text-3xl font-semibold text-arbor-text mb-2">
            Acesse sua conta
          </h1>
          <p className="text-sm text-arbor-subtle mb-8">
            Plataforma restrita a profissionais de wealth management.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-arbor-subtle mb-1.5 uppercase tracking-wider">
                E-mail profissional
              </label>
              <input
                id="email"
                type="email"
                defaultValue="joao.silva@btgwealth.com.br"
                required
                className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 px-4 py-3 text-sm text-arbor-text placeholder-arbor-muted focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-arbor-subtle mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <input
                id="password"
                type="password"
                defaultValue="••••••••"
                required
                className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 px-4 py-3 text-sm text-arbor-text placeholder-arbor-muted focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-arbor-accent py-3 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-xs text-arbor-muted text-center">
            Acesso restrito. Solicite credenciais ao administrador da plataforma.
          </p>
        </div>
      </div>

      {/* Painel de valor — lado direito */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-center px-12 py-12 bg-arbor-surface border-l border-arbor-border">
        <p className="text-xs uppercase tracking-widest text-arbor-accent mb-4 font-sans">
          ARBOR · Wealth Planning
        </p>
        <h2 className="font-serif text-2xl font-semibold text-arbor-text mb-2 leading-snug">
          Inteligência patrimonial para o futuro jurídico.
        </h2>
        <p className="text-sm text-arbor-subtle mb-8">
          Copiloto do advogado e gestor de wealth planning em reuniões de sucessão.
        </p>

        <ul className="space-y-4 mb-10">
          {[
            'Simulação dos três cenários sucessórios em segundos',
            'Mapa tributário ITCMD atualizado por estado',
            'Alertas automáticos de janelas tributárias ativas',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border border-arbor-accent flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-arbor-accent" />
              </span>
              <span className="text-sm text-arbor-subtle">{item}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-arbor-border bg-arbor-surface2 px-6 py-5">
          <p className="font-serif text-3xl font-semibold text-arbor-text">R$ 2,4 bi</p>
          <p className="text-xs text-arbor-subtle mt-1">
            em patrimônio simulado pela plataforma · versão demo
          </p>
        </div>
      </div>
    </div>
  );
}
