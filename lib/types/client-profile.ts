// Tipos do input do formulário (perfil patrimonial preenchido pelo advisor).

export type BrazilianState =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export const BRAZILIAN_STATES: readonly BrazilianState[] = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
] as const;

export type AssetComposition = {
  realEstate: number;      // imóveis em R$
  investments: number;     // investimentos financeiros em R$
  companies: number;       // participação em empresas em R$
  privatePension: number;  // previdência privada (PGBL/VGBL) em R$
  other: number;
};

export type PlanningGoal =
  | 'protect_spouse'
  | 'avoid_family_conflict'
  | 'reduce_tax_burden'
  | 'business_succession'
  | 'asset_protection';

export const PLANNING_GOALS: readonly PlanningGoal[] = [
  'protect_spouse',
  'avoid_family_conflict',
  'reduce_tax_burden',
  'business_succession',
  'asset_protection',
] as const;

export const PLANNING_GOAL_LABELS: Record<PlanningGoal, string> = {
  protect_spouse: 'Proteger o cônjuge',
  avoid_family_conflict: 'Evitar conflito familiar',
  reduce_tax_burden: 'Reduzir carga tributária',
  business_succession: 'Sucessão empresarial',
  asset_protection: 'Proteção patrimonial',
};

export type ClientProfile = {
  totalPatrimony: number;        // soma deve bater com AssetComposition (tolerância 1%)
  state: BrazilianState;
  composition: AssetComposition;
  numberOfHeirs: number;
  hasSpouse: boolean;
  primaryGoal: PlanningGoal;
  secondaryGoals?: PlanningGoal[];
};
