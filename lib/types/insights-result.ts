// Nomes evitam "recommendation"/"advice" — blindagem contra exercício ilegal da advocacia.
export type UrgencyLevel = 'low' | 'medium' | 'high';

export type TaxWindowAlert = {
  hasActiveWindow: boolean;
  alertTitle:      string;
  alertBody:       string;
  urgencyLevel:    UrgencyLevel;
};

export type NextStepCategory =
  | 'legal_structure'
  | 'tax_optimization'
  | 'beneficiary_review'
  | 'documentation';

export type NextStep = {
  title:           string;
  description:     string;
  category:        NextStepCategory;
  estimatedImpact: string;
};

export type InsightsResult = {
  taxWindow:       TaxWindowAlert;
  topicsToDiscuss: NextStep[];
  generatedAt:     string;
  llmDisclaimer:   string;
};
