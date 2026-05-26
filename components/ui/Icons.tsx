// SVGs inline — institucional, sem dependência externa.
// Stroke 1.5, currentColor (herda do parent). Tamanho default 16px.

type IconProps = {
  className?: string;
  'aria-hidden'?: boolean;
};

function svgProps(p: IconProps) {
  return {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: p.className,
    'aria-hidden': p['aria-hidden'] ?? true,
  };
}

export function ScalesIcon(p: IconProps): JSX.Element {
  // legal_structure
  return (
    <svg {...svgProps(p)}>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M5 7h14" />
      <path d="M5 7l-3 7a4 4 0 0 0 6 0L5 7z" />
      <path d="M19 7l-3 7a4 4 0 0 0 6 0l-3-7z" />
    </svg>
  );
}

export function ChartDownIcon(p: IconProps): JSX.Element {
  // tax_optimization
  return (
    <svg {...svgProps(p)}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-7" />
      <path d="M19 11V7" />
      <path d="M15 7h4" />
    </svg>
  );
}

export function UsersIcon(p: IconProps): JSX.Element {
  // beneficiary_review
  return (
    <svg {...svgProps(p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function DocumentIcon(p: IconProps): JSX.Element {
  // documentation
  return (
    <svg {...svgProps(p)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

export function AlertIcon(p: IconProps): JSX.Element {
  // Block 3 — institucional, não emergencial
  return (
    <svg {...svgProps(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h0" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps): JSX.Element {
  return (
    <svg {...svgProps(p)}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
