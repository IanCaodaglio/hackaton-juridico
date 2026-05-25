// PLACEHOLDER: cliente da API do Claude (Anthropic).
//
// TODO(etapa 3): implementar wrapper para chamadas à Anthropic API.
// REGRAS:
//   - SEMPRE server-side. NUNCA importar este módulo em componentes "use client".
//   - Ler ANTHROPIC_API_KEY de process.env, nunca hardcoded.
//   - Habilitar prompt caching nos system prompts longos.
//   - Modelo padrão sugerido: 'claude-opus-4-7' (verificar disponibilidade
//     na conta antes de subir).
//   - Implementar timeout e tratamento de erros (rate limit, 5xx, abort).
//   - NUNCA logar o prompt completo nem a resposta no servidor: pode conter
//     dados pessoais do cliente final (LGPD).

export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClaudeCallOptions = {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
};

export async function callClaude(_options: ClaudeCallOptions): Promise<string> {
  // TODO(etapa 3): implementar com @anthropic-ai/sdk.
  // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const response = await client.messages.create({ ... });
  // return response.content[0].type === 'text' ? response.content[0].text : '';
  throw new Error('callClaude não implementado (etapa 3).');
}
