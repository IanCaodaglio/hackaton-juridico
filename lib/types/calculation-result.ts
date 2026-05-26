export type PatrimonialBreakdown = {
  toHeirs:                 number;
  itcmdLoss:               number;
  inventoryCost:           number;
  incomeTaxOnInvestments:  number;
  total:                   number;
};

export type ScenarioName = 'no_planning' | 'donation_plus_offshore' | 'holding_plus_trust';

export type Scenario = {
  name:        ScenarioName;
  displayName: string;
  breakdown:   PatrimonialBreakdown;
  caveats:     string[];
};

export type CalculationResult = {
  scenarios:             Scenario[];
  recommendedScenario:   ScenarioName;
  savingsVsNoPlanning:   number;
  projectedAt8pct?:      { current: number; projected: number; delta: number };
  calculationDisclaimer: string;
};
