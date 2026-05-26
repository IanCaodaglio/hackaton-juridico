'use client';

import { forwardRef, useId } from 'react';
import { formatBRLFromCents } from '@/lib/format';

// Input com máscara BRL "ao digitar".
// Estratégia: tratamos o valor como CENTAVOS inteiros (R$ 12,34 = 1234).
// O usuário digita apenas dígitos; o componente formata na hora.
// Backspace remove o último dígito (= divide por 10). Funciona bem para
// valores monetários sem precisar de bibliotecas de máscara.

type Props = {
  label: string;
  cents: number;
  onChangeCents: (cents: number) => void;
  required?: boolean;
  hint?: string;
  invalid?: boolean;
  className?: string;
};

const CurrencyInput = forwardRef<HTMLInputElement, Props>(function CurrencyInput(
  { label, cents, onChangeCents, required, hint, invalid, className },
  ref,
) {
  const id = useId();
  const display = formatBRLFromCents(cents);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const digits = e.target.value.replace(/\D/g, '');
    const next = digits === '' ? 0 : Number.parseInt(digits, 10);
    if (Number.isFinite(next)) onChangeCents(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    // Permite navegação/edição padrão. Bloqueia apenas caracteres
    // não-numéricos óbvios; o regex em handleChange faz a limpeza final.
    if (
      e.key.length === 1 &&
      !/\d/.test(e.key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
      >
        {label}
        {required && <span className="ml-0.5 text-loss" aria-hidden>*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`tabular mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm
          transition focus:outline-none focus:ring-2 focus:ring-accent
          ${invalid ? 'border-loss' : 'border-line hover:border-ink-subtle'}`}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
});

export default CurrencyInput;
