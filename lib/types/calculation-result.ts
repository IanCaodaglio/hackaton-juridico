// Tipos do output dos blocos 1 e 2 (cálculo determinístico).

export type PatrimonialBreakdown = {
  toHeirs: number;                  // o que efetivamente chega aos herdeiros
  itcmdLoss: number;                // imposto de transmissão causa mortis/doação
  inventoryCost: number;            // custos de inventário (taxa, advogado estimado)
  incomeTaxOnInvestments: number;   // IR sobre ganhos não realizados
  total: number;                    // patrimônio total considerado no cenário
};

export type ScenarioName = 'no_planning' | 'lifetime_donation' | 'family_holding';

export type Scenario = {
  name: ScenarioName;
  displayName: string;
  breakdown: PatrimonialBreakdown;
  caveats: string[];                // limitações/riscos do cenário
};

export type CalculationResult = {
  scenarios: Scenario[];
  recommendedScenario: ScenarioName;
  savingsVsNoPlanning: number;
  calculationDisclaimer: string;    // texto sobre o caráter estimativo
};
