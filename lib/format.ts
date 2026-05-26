// Formatadores para BRL e porcentagem. Sempre usar pt-BR.

const BRL_FMT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BRL_FMT_NO_FRAC = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const PCT_FMT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatBRL(value: number, withCents = true): string {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return (withCents ? BRL_FMT : BRL_FMT_NO_FRAC).format(value);
}

export function formatPercent(ratio: number, decimals = 1): string {
  if (!Number.isFinite(ratio)) return '0%';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(ratio);
}

export function formatBRLCompact(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} bi`;
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)} mil`;
  return BRL_FMT_NO_FRAC.format(value);
}

// Para inputs com máscara: converte string digitada em número.
// Aceita "1.234,56", "1234,56", "1234.56", "R$ 1.234,56" → 1234.56
export function parseBRL(input: string): number {
  if (!input) return 0;
  const cleaned = input
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// Para a máscara: formata um número de "centavos crus" do input.
// Ex.: usuário digita "1234567" → entendemos como R$ 12.345,67.
// Mantém-se sempre 2 decimais.
export function formatBRLFromCents(cents: number): string {
  return BRL_FMT.format(cents / 100);
}

// Versão sem símbolo R$, útil em headlines onde o "R$" vem antes.
export function formatNumberBR(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

void PCT_FMT;
