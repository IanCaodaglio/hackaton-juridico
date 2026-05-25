// Tipos do output dos blocos 3 e 4 (gerados via LLM).
// IMPORTANTE: nomes propositalmente evitam "recommendation"/"advice" para
// blindagem contra exercício ilegal da advocacia. Usar "topics_to_discuss",
// "considerations", "items_for_professional_review".

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type TaxWindowAlert = {
  hasActiveWindow: boolean;
  alertTitle: string;
  alertBody: string;          // gerado por LLM
  urgencyLevel: UrgencyLevel;
};

export type NextStepCategory =
  | 'legal_structure'
  | 'tax_optimization'
  | 'beneficiary_review'
  | 'documentation';

export type NextStep = {
  title: string;
  description: string;        // gerado por LLM
  category: NextStepCategory;
};

export type InsightsResult = {
  taxWindow: TaxWindowAlert;
  topicsToDiscuss: NextStep[]; // NÃO "recommendations"
  generatedAt: string;         // ISO 8601
  llmDisclaimer: string;
};
