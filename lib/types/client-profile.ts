export type BrazilianState =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export const BRAZILIAN_STATES: readonly BrazilianState[] = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
] as const;

export const MVP_STATES: readonly BrazilianState[] = ['SP','RJ','MG','RS','PR','SC','DF'] as const;

export type AssetComposition = {
  realEstate:     number;
  investments:    number;
  companies:      number;
  privatePension: number;
  other:          number;
};

export type OffshoreStructure =
  | 'direct_account'
  | 'offshore_company'
  | 'revocable_trust'
  | 'irrevocable_trust'
  | 'international_funds';

export const OFFSHORE_STRUCTURE_LABELS: Record<OffshoreStructure, string> = {
  direct_account:     'Conta bancária direta',
  offshore_company:   'Empresa offshore (BVI/Cayman/Delaware)',
  revocable_trust:    'Trust revogável',
  irrevocable_trust:  'Trust irrevogável',
  international_funds:'Fundos internacionais',
};

export type MarriageRegime =
  | 'comunhao_parcial'
  | 'comunhao_universal'
  | 'separacao_total'
  | 'participacao_aquestos';

export const MARRIAGE_REGIME_LABELS: Record<MarriageRegime, string> = {
  comunhao_parcial:     'Comunhão parcial de bens',
  comunhao_universal:   'Comunhão universal de bens',
  separacao_total:      'Separação total de bens',
  participacao_aquestos:'Participação final nos aquestos',
};

export type PlanningGoal =
  | 'protect_spouse'
  | 'avoid_family_conflict'
  | 'reduce_tax_burden'
  | 'business_succession'
  | 'asset_protection';

export const PLANNING_GOALS: readonly PlanningGoal[] = [
  'protect_spouse', 'avoid_family_conflict', 'reduce_tax_burden',
  'business_succession', 'asset_protection',
] as const;

export const PLANNING_GOAL_LABELS: Record<PlanningGoal, string> = {
  protect_spouse:       'Proteger o cônjuge',
  avoid_family_conflict:'Evitar conflito familiar',
  reduce_tax_burden:    'Reduzir carga tributária',
  business_succession:  'Sucessão empresarial',
  asset_protection:     'Proteção patrimonial',
};

export type TimeHorizon = 0 | 5 | 10 | 20;

export type AssetGrowthRates = {
  fixedIncome:    number; // default 0.105
  variableIncome: number; // default 0.12
  realEstate:     number; // default 0.06
  equity:         number; // default 0.18
  offshore:       number; // default 0.08
  crypto:         number; // default 0.20
};

export const DEFAULT_GROWTH_RATES: AssetGrowthRates = {
  fixedIncome:    0.105,
  variableIncome: 0.12,
  realEstate:     0.06,
  equity:         0.18,
  offshore:       0.08,
  crypto:         0.20,
};

export type ScenarioKey =
  | 'sem-planejamento'
  | 'doacao-offshore'
  | 'holding-trust';

export type ClientProfile = {
  clientName?:          string;
  totalPatrimony:       number;
  state:                BrazilianState;
  marriageRegime?:      MarriageRegime;
  composition:          AssetComposition;
  numberOfHeirs:        number;
  hasSpouse:            boolean;
  primaryGoal:          PlanningGoal;
  secondaryGoals?:      PlanningGoal[];
  offshoreAssets?:      {
    totalValue:  number;
    structures:  OffshoreStructure[];
  };
  cryptoAssets?:        number;
  timeHorizon:          TimeHorizon;
  growthRates:          AssetGrowthRates;
  scenariosToCompare?:  ScenarioKey[];
};
