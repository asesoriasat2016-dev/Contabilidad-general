export type LegalSocietyType = 'SAS' | 'SA' | 'LTDA' | 'EU' | 'PERSONA_NATURAL';

export interface LegalStep {
  id: string;
  number: number;
  title: string;
  entity: string;
  description: string;
  lawReference: string;
  completed: boolean;
  notes?: string;
}

export interface CompanyProfile {
  name: string;
  nit: string;
  legalType: LegalSocietyType;
  city: string;
  capitalAuthorized: number;
  capitalSubscribed: number;
  capitalPaid: number;
  economicActivityCode: string; // CIIU
  activityDescription: string;
  taxRegime: 'Responsable de IVA' | 'No Responsable' | 'Régimen Simple de Tributación';
  legalRepresentative: string;
  idRepresentative: string;
  fiscalAuditor?: string;
  accountingStandard: 'NIIF_PYMES' | 'NIIF_PLENAS';
  legalSteps: LegalStep[];
}

export interface OpeningPartnerContribution {
  id: string;
  partnerName: string;
  partnerDoc: string;
  sharesOrQuotas: number;
  nominalValue: number;
  cashContribution: number;
  inventoryContribution: number;
  equipmentContribution: number;
  propertyContribution: number;
  otherAssetsContribution: number;
  liabilityAssumed: number;
  netContribution: number;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  entity?: string;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  concept: string;
  sourceModule: 'CONSTITUCION' | 'INVENTARIO' | 'CARTERA' | 'NOMINA' | 'PROVISION' | 'AJUSTE' | 'CIERRE';
  lines: JournalLine[];
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  initialStock: number;
  initialUnitCost: number;
  sellingPrice: number;
}

export type MovementType = 'INVENTARIO_INICIAL' | 'COMPRA' | 'VENTA' | 'DEVOLUCION_COMPRA' | 'DEVOLUCION_VENTA';

export interface KardexEntry {
  id: string;
  date: string;
  itemId: string;
  documentRef: string;
  type: MovementType;
  // Entradas
  inQty: number;
  inUnitCost: number;
  inTotal: number;
  // Salidas
  outQty: number;
  outUnitCost: number;
  outTotal: number;
  // Saldos
  balanceQty: number;
  balanceUnitCost: number;
  balanceTotal: number;
}

export interface ClientReceivable {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientNit: string;
  issueDate: string;
  dueDate: string;
  termDays: number;
  totalInvoice: number;
  collectedAmount: number;
  balance: number;
  daysOverdue: number;
  agingBucket: 'VIGENTE' | '1_30' | '31_60' | '61_90' | 'MAS_90';
}

export interface ProvisionSimulation {
  method: 'NIIF_9_PCE' | 'FISCAL_INDIVIDUAL' | 'FISCAL_GENERAL';
  rateDescription: string;
  totalReceivablesBalance: number;
  eligibleOverdueBalance: number;
  calculatedProvision: number;
  recognizedInAccounting: boolean;
  notes: string;
}

export interface ContingentProvision {
  id: string;
  type: 'LITIGIO_LABORAL' | 'GARANTIA_PRODUCTO' | 'PROCESO_TRIBUTARIO' | 'AMBIENTAL';
  description: string;
  estimatedAmount: number;
  probability: 'PROBABLE' | 'POSIBLE' | 'REMOTA';
  recognizedAsLiability: boolean;
  accountingStandard: string;
}

export interface Employee {
  id: string;
  document: string;
  fullName: string;
  position: string;
  baseSalary: number;
  daysWorked: number;
  dayOvertimeHours: number;
  nightOvertimeHours: number;
  sundayHolidayHours: number;
  appliesTransportAllowance: boolean;
  riskLevelArl: 1 | 2 | 3 | 4 | 5; // 0.522%, 1.044%, 2.436%, 4.350%, 6.960%
  // Deducciones voluntarias
  otherDeductions: number;
}

export interface PayrollRowCalculation {
  employee: Employee;
  basicEarned: number;
  dayOvertimePay: number;
  nightOvertimePay: number;
  sundayHolidayPay: number;
  transportAllowancePay: number;
  totalDevengado: number;
  salarialBase: number;
  healthWorker: number; // 4%
  pensionWorker: number; // 4%
  totalDeductionsWorker: number;
  netPayableWorker: number;
  // Patronal
  healthEmployer: number; // 8.5%
  pensionEmployer: number; // 12%
  arlEmployer: number;
  sena: number; // 2%
  icbf: number; // 3%
  cajaCompensacion: number; // 4%
  // Prestaciones sociales
  cesantias: number; // 8.33%
  interesesCesantias: number; // 1%
  primaServicios: number; // 8.33%
  vacaciones: number; // 4.16%
  totalEmployerCost: number;
}

export interface AdjustmentItem {
  id: string;
  type: 'DEPRECIACION' | 'AMORTIZACION' | 'GASTO_ANTICIPADO' | 'DETERIORO_INVENTARIO' | 'CIERRE_EJERCICIO';
  assetName: string;
  historicalCost: number;
  salvageValue: number;
  usefulLifeMonths: number;
  monthsToAdjust: number;
  calculatedAmount: number;
  description: string;
  applied: boolean;
}

export interface FinancialNote {
  number: number;
  title: string;
  standardReference: string;
  content: string;
  breakdownTable?: {
    headers: string[];
    rows: Array<Array<string | number>>;
    totalLabel?: string;
    totalValue?: number | string;
  };
}

export type ActiveTab = 
  | 'LEGAL'
  | 'APERTURA'
  | 'INVENTARIOS'
  | 'CARTERA'
  | 'PROVISIONES'
  | 'NOMINA'
  | 'AJUSTES'
  | 'ESTADOS_FINANCIEROS'
  | 'LIBRO_DIARIO'
  | 'CATEDRA_DOCENTE';
