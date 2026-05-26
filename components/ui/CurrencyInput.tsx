'use client';

import { useRef } from 'react';

type Props = {
  id?:          string;
  label:        string;
  value:        number;      // valor em centavos
  onChange:     (cents: number) => void;
  tooltip?:     string;
  required?:    boolean;
  className?:   string;
};

export default function CurrencyInput({ id, label, value, onChange, tooltip, required, className }: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const display = value
    ? (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    onChange(digits ? parseInt(digits, 10) : 0);
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-arbor-subtle mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-arbor-loss">*</span>}
        {tooltip && (
          <span title={tooltip} className="cursor-help text-arbor-muted hover:text-arbor-subtle transition-colors duration-150">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
        )}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-arbor-muted select-none">R$</span>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          required={required}
          placeholder="0,00"
          className="w-full rounded-lg border border-arbor-border bg-arbor-surface2 pl-9 pr-4 py-2.5 text-sm text-arbor-text tabular placeholder-arbor-muted focus:border-arbor-accent focus:outline-none focus:ring-1 focus:ring-arbor-accent transition-colors duration-150"
        />
      </div>
    </div>
  );
}
