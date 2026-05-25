import type { ClientProfile } from '@/lib/types/client-profile';

// Logging de servidor com SANITIZAÇÃO. Nunca logar payload completo do
// cliente final (LGPD). Apenas metadados de baixa granularidade.

function orderOfMagnitude(value: number): string {
  if (value <= 0) return '0';
  const exp = Math.floor(Math.log10(value));
  return `~1e${exp}`;
}

export function safeProfileMetadata(profile: ClientProfile): Record<string, unknown> {
  return {
    state: profile.state,
    patrimonyMagnitude: orderOfMagnitude(profile.totalPatrimony),
    hasSpouse: profile.hasSpouse,
    numberOfHeirs: profile.numberOfHeirs,
    primaryGoal: profile.primaryGoal,
    // NUNCA incluir: composição absoluta, totalPatrimony absoluto,
    // qualquer identificador do cliente final.
  };
}
