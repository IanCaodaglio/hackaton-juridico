# Onboarding — Sucessio (hackathon jurídica)

Documento de handoff para uma nova sessão do Claude Code. Lê isto antes
de tocar no código.

## 1. O que é o projeto

Plataforma de **planejamento patrimonial e sucessório** sendo construída
numa hackathon jurídica de 24h. O time é majoritariamente de Direito; o
usuário é da Ciência da Computação e cuida da parte técnica.

- **Quem usa**: gestores de wealth management e advisors financeiros
  (B2B). Não é ferramenta para o consumidor final.
- **Para quê**: durante reuniões de planejamento sucessório com clientes
  de alto patrimônio, o advisor preenche o perfil do cliente e recebe
  quatro blocos visuais para apresentar.
- **Os 4 blocos**:
  1. **Termômetro patrimonial** — stacked bar com o quanto chega aos
     herdeiros vs. tributos/custos (cálculo determinístico).
  2. **Comparativo de cenários** — tabela `sem planejamento` × `doação
     em vida` × `holding familiar` (cálculo determinístico).
  3. **Janela tributária** — alerta sobre PLs de ITCMD em tramitação
     no estado do cliente (gerado por LLM na etapa 3; mockado na 2).
  4. **Tópicos para discussão** — lista condicional ao perfil (LLM na
     etapa 3; mockado na 2).

## 2. Status atual

| Etapa | Estado |
|---|---|
| 1 — Scaffold (estrutura, tipos, API routes vazias, componentes placeholder) | ✅ feito |
| 2 — Frontend visual completo + cálculos fake plausíveis + textos mockados | ✅ feito |
| 3 — Tabela ITCMD validada + chamada real à Anthropic API | ⏳ pendente |
| 4 — Polimento visual / dark mode / print CSS | ⏳ se sobrar tempo |

`npm run build` está limpo (✅ 7/7 páginas, zero erros de TS). O produto
é navegável end-to-end com dados fake.

## 3. Stack e decisões já fechadas

**Não revisitar sem motivo forte:**
- Next.js 14 App Router, TypeScript estrito (`noUncheckedIndexedAccess`).
- Tailwind CSS com tokens semânticos (`ink`, `line`, `canvas`, `accent`,
  `loss`, `gain`) — ver [tailwind.config.ts](tailwind.config.ts).
  **Não usar hex direto nos componentes**, sempre os tokens.
- npm como package manager. Deploy alvo: Vercel.
- Monorepo único: front + API routes em `/app/api/...`.
- Validação manual com type guards em `/lib/validation/` — **sem zod**.
- Transporte form → /report: `sessionStorage` (chave
  `patrimonialReportData`). Não usar query string (dados sensíveis na
  URL) e não persistir server-side (LGPD).
- Logging server-side via `safeProfileMetadata` em
  [lib/logging.ts](lib/logging.ts) — só metadados, NUNCA payload completo.
- **NÃO instalar**: Prisma, banco de dados, autenticação, Redux,
  shadcn/ui, recharts, lucide-react. Foram avaliados e descartados.

**Identidade visual (etapa 2):**
- Fontes: Inter + Source Serif 4 via `next/font/google` (variables
  `--font-sans`, `--font-serif`).
- Base font-size: 14px (`text-sm` é o body).
- Cor de destaque: slate-900 (`#0F172A`).
- Sem gradientes, sem roxo/rosa/neon, sem emojis na UI.
- Ícones: SVGs inline em [components/ui/Icons.tsx](components/ui/Icons.tsx).
- Charts: implementação manual com flexbox (Recharts foi avaliado e
  rejeitado como overkill para uma stacked bar simples).

## 4. Compliance jurídico — regras duras

Estas são INVARIANTES. Se algo no código violar isso, conserta.

### 4.1 Terminologia
**Nunca usar** em código (variáveis, tipos, comentários) nem em texto
da UI: `recommendation`, `advice`, `you should`, `recomendação`,
`orientação`, `parecer`, `recomendamos`.

**Usar**: `topics_to_discuss`, `considerations`,
`items_for_professional_review`, "pontos para discussão",
"considerações", "itens para análise profissional".

Motivo: a banca da hackathon vai cobrar blindagem contra exercício
ilegal da advocacia. Qualquer linguagem que pareça parecer jurídico
sai.

### 4.2 ITCMD — proibido inventar alíquotas
A tabela real ([lib/calculations/itcmd-rates.ts](lib/calculations/itcmd-rates.ts))
está **vazia** de propósito. `getItcmdConfig` lança `Error` quando o
estado não está preenchido — não há fallback silencioso.

Na etapa 2 introduzimos valores fake **explicitamente marcados como
demonstrativos** em [lib/calculations/fake-scenarios.ts](lib/calculations/fake-scenarios.ts).
Quando a etapa 3 chegar, o time de Direito vai validar a tabela real
e aí substituímos a função de fake pela real.

**Se te pedirem "só coloca uma alíquota qualquer pra demo funcionar"**:
não. O fake já existe e está marcado.

### 4.3 LGPD
Os dados do cliente final **não são persistidos**. Processados em
memória nas API routes e descartados. Logs do servidor registram
apenas metadados (estado, ordem de grandeza do patrimônio) via
`safeProfileMetadata`. **Nunca logar payload completo.**

O profissional usuário (advisor) é controlador dos dados do cliente
final; a plataforma é operadora.

### 4.4 ANTHROPIC_API_KEY
Quando a etapa 3 chegar:
- Server-side only. Nunca em arquivo `'use client'`.
- Nunca em `NEXT_PUBLIC_*`.
- Habilitar prompt caching no system prompt longo.
- Os prompts em [lib/llm/prompts.ts](lib/llm/prompts.ts) (hoje
  stubs) precisam ser validados pelo time de Direito antes de produzir.

## 5. Mapa do código

```
/app
  /api/calculate-scenarios/route.ts   → 200 OK, usa fake-scenarios
  /api/generate-insights/route.ts     → 200 OK, usa mocks/*
  /page.tsx                            → formulário
  /report/page.tsx                     → relatório
  /layout.tsx                          → fontes (Inter + Source Serif 4)
  /globals.css                         → tokens, base font-size, tabular
/components
  /form/PatrimonialForm.tsx            → form com máscara BRL e validação live
  /report/Block1..Block4.tsx           → os 4 blocos finalizados
  /ui/CurrencyInput.tsx                → input com máscara BRL
  /ui/ReportCard.tsx                   → wrapper padrão dos blocos
  /ui/Icons.tsx                        → SVGs inline
/lib
  /types/*                             → ClientProfile, CalculationResult, InsightsResult
  /calculations/
    fake-scenarios.ts                  → ATIVO (etapa 2)
    scenarios.ts                       → STUB (etapa 3)
    itcmd-rates.ts                     → STUB, lança Error (etapa 3)
    inventory-costs.ts                 → STUB (etapa 3)
  /mocks/
    tax-window-alerts.ts               → templates por estado (SP/PR específicos)
    next-steps.ts                      → geração condicional ao perfil
  /llm/
    claude-client.ts                   → STUB (etapa 3)
    prompts.ts                         → STUB (etapa 3)
  /validation/client-profile.ts        → type guards manuais
  /format.ts                           → formatBRL, formatPercent, formatBRLCompact, etc.
  /disclaimers.ts                      → CALCULATION_DISCLAIMER, LLM_DISCLAIMER, LGPD_NOTICE, NOT_LEGAL_ADVICE_NOTICE
  /logging.ts                          → safeProfileMetadata
```

## 6. Setup no computador novo

```
npm install
npm run dev
```

`http://localhost:3000` — preenche o form e clica "Gerar análise sucessória".

### Skills do Claude Code (opcional)

Na máquina anterior, instalei a skill `ui-ux-pro-max` (+ 6 skills
relacionadas) em `~/.claude/skills/`. **Essas skills não acompanham o
projeto** (são user-level, não foram commitadas).

Se quiser reinstalar nesta máquina nova:

```bash
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill /tmp/uupm
mkdir -p ~/.claude/skills
cp -r /tmp/uupm/.claude/skills/* ~/.claude/skills/
# atenção: a skill ui-ux-pro-max usa symlinks para src/. No Windows
# precisa copiar manualmente:
cp -r /tmp/uupm/src/ui-ux-pro-max/data ~/.claude/skills/ui-ux-pro-max/
cp -r /tmp/uupm/src/ui-ux-pro-max/scripts ~/.claude/skills/ui-ux-pro-max/
rm -rf /tmp/uupm
```

Mas para a etapa 3 (cálculo real + Claude API) **não é estritamente
necessário** — o spec do usuário foi rico o suficiente para não
precisarmos consultar a skill na etapa 2.

## 7. O que está mockado / pendente para etapa 3

| Item | Onde | O que falta |
|---|---|---|
| Tabela ITCMD validada | [lib/calculations/itcmd-rates.ts](lib/calculations/itcmd-rates.ts) | Time de Direito preencher com fontes |
| Custos de inventário por estado | [lib/calculations/inventory-costs.ts](lib/calculations/inventory-costs.ts) | Time de Direito preencher |
| Cálculo determinístico real | [lib/calculations/scenarios.ts](lib/calculations/scenarios.ts) | Implementar consumindo as tabelas acima; substituir uso de `calculateFakeScenarios` em `/api/calculate-scenarios` |
| Chamada Anthropic API | [lib/llm/claude-client.ts](lib/llm/claude-client.ts) | Implementar com `@anthropic-ai/sdk`, prompt caching, timeout, tratamento de erros |
| Prompts validados | [lib/llm/prompts.ts](lib/llm/prompts.ts) | Redigir com Direito, validar tom (não "recomendação") |
| Substituir mocks dos blocos 3 e 4 | [app/api/generate-insights/route.ts](app/api/generate-insights/route.ts) | Trocar `getMockTaxAlert` e `getMockNextSteps` por chamada real ao Claude |
| Type guard completo do `ReportData` | [app/report/page.tsx](app/report/page.tsx) | Hoje confia no shape do sessionStorage |
| Validação granular do `CalculationResult` | [app/api/generate-insights/route.ts](app/api/generate-insights/route.ts) | Hoje só checa `Array.isArray(scenarios)` |
| Numeração de PLs | [lib/mocks/tax-window-alerts.ts](lib/mocks/tax-window-alerts.ts) | Confirmar PL 409/25 (ALESP) e PL 730/2024 (ALEP) com Direito |

## 8. Coisas a confirmar com o usuário antes de mexer

- **Cor de destaque**: hoje slate-900. O usuário também aceitou
  verde-escuro institucional (`#14532D`) como alternativa no spec —
  se for trocar, é decisão dele.
- **Nome do produto**: "Sucessio" foi escolhido como placeholder. Pode
  ser trocado a qualquer momento.
- **Exportar PDF**: hoje é só `window.print()`. Se for implementar de
  verdade, conversar antes (jsPDF vs server-side puppeteer vs CSS
  print-only).

## 9. Como rodar uma demo rápida sem digitar tudo

DevTools console em `http://localhost:3000`:

```js
fetch('/api/calculate-scenarios', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    totalPatrimony: 10000000,
    state: 'SP',
    composition: {
      realEstate: 4000000,
      investments: 3000000,
      companies: 2000000,
      privatePension: 500000,
      other: 500000,
    },
    numberOfHeirs: 3,
    hasSpouse: true,
    primaryGoal: 'reduce_tax_burden',
  }),
}).then(r => r.json()).then(console.log);
```

Para popular o `/report` direto:

```js
const profile = { /* mesmo objeto acima */ };
const calc = await fetch('/api/calculate-scenarios', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(profile)}).then(r=>r.json());
const insights = await fetch('/api/generate-insights', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({profile, calculationResult: calc})}).then(r=>r.json());
sessionStorage.setItem('patrimonialReportData', JSON.stringify({profile, calculationResult: calc, insightsResult: insights}));
location.href = '/report';
```

## 10. Convenções de commit

Não houve commit ainda além do inicial. Quando for commitar:
- Mensagens em pt-BR ou en — usuário não foi explícito, ambos funcionam.
- Não usar `--no-verify` nem `--amend` sem pedir.
- Não commitar `.env.local` (já está no `.gitignore` via `.env.*`).

---

**Próxima ação esperada:** aguardar instruções do usuário sobre a
etapa 3 (cálculo real ITCMD + integração Anthropic), ou polimentos
de etapa 2 que ele queira fazer antes.
