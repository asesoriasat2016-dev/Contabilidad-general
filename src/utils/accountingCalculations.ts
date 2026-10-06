import {
  CONSTANTS
} from '../data/initialData';
import {
  Employee,
  PayrollRowCalculation,
  ClientReceivable,
  ProvisionSimulation,
  ContingentProvision,
  KardexEntry,
  OpeningPartnerContribution,
  AdjustmentItem,
  JournalEntry,
  JournalLine,
  FinancialNote,
  CompanyProfile
} from '../types/accounting';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

// 1. CÁLCULO DE NÓMINA INDIVIDUAL Y CONSOLIDADA
export function calculateEmployeePayroll(emp: Employee): PayrollRowCalculation {
  const days = Math.min(Math.max(emp.daysWorked, 0), 30);
  const basicEarned = (emp.baseSalary / 30) * days;
  
  const hourRate = emp.baseSalary / 240;
  const dayOvertimePay = hourRate * 1.25 * emp.dayOvertimeHours;
  const nightOvertimePay = hourRate * 1.75 * emp.nightOvertimeHours;
  const sundayHolidayPay = hourRate * 2.0 * emp.sundayHolidayHours;

  const appliesAux = emp.appliesTransportAllowance && emp.baseSalary <= (CONSTANTS.SMMLV * 2);
  const transportAllowancePay = appliesAux ? (CONSTANTS.AUX_TRANSPORTE / 30) * days : 0;

  const salarialBase = basicEarned + dayOvertimePay + nightOvertimePay + sundayHolidayPay;
  const totalDevengado = salarialBase + transportAllowancePay;

  // Deducciones del trabajador (salud 4% y pensión 4% sobre base salarial sin auxilio)
  const healthWorker = Math.round(salarialBase * CONSTANTS.HEALTH_WORKER);
  const pensionWorker = Math.round(salarialBase * CONSTANTS.PENSION_WORKER);
  const totalDeductionsWorker = healthWorker + pensionWorker + emp.otherDeductions;
  const netPayableWorker = totalDevengado - totalDeductionsWorker;

  // Aportes Patronales (Seguridad Social)
  const healthEmployer = Math.round(salarialBase * CONSTANTS.HEALTH_EMPLOYER);
  const pensionEmployer = Math.round(salarialBase * CONSTANTS.PENSION_EMPLOYER);
  const arlRate = CONSTANTS.ARL_RATES[emp.riskLevelArl] || 0.00522;
  const arlEmployer = Math.round(salarialBase * arlRate);

  // Parafiscales
  const sena = Math.round(salarialBase * CONSTANTS.SENA);
  const icbf = Math.round(salarialBase * CONSTANTS.ICBF);
  const cajaCompensacion = Math.round(salarialBase * CONSTANTS.CAJA_COMPENSACION);

  // Prestaciones Sociales (Cesantías y prima sobre devengado total; vacaciones sobre base salarial)
  const cesantias = Math.round(totalDevengado * CONSTANTS.CESANTIAS);
  const interesesCesantias = Math.round(cesantias * CONSTANTS.INTERESES_CESANTIAS);
  const primaServicios = Math.round(totalDevengado * CONSTANTS.PRIMA_SERVICIOS);
  const vacaciones = Math.round(salarialBase * CONSTANTS.VACACIONES);

  const totalEmployerCost = 
    totalDevengado + 
    healthEmployer + 
    pensionEmployer + 
    arlEmployer + 
    sena + 
    icbf + 
    cajaCompensacion + 
    cesantias + 
    interesesCesantias + 
    primaServicios + 
    vacaciones;

  return {
    employee: emp,
    basicEarned,
    dayOvertimePay,
    nightOvertimePay,
    sundayHolidayPay,
    transportAllowancePay,
    totalDevengado,
    salarialBase,
    healthWorker,
    pensionWorker,
    totalDeductionsWorker,
    netPayableWorker,
    healthEmployer,
    pensionEmployer,
    arlEmployer,
    sena,
    icbf,
    cajaCompensacion,
    cesantias,
    interesesCesantias,
    primaServicios,
    vacaciones,
    totalEmployerCost
  };
}

// 2. CÁLCULO DE DETERIORO DE CARTERA (NIIF 9 vs FISCAL)
export function calculateReceivablesAging(receivables: ClientReceivable[]) {
  const summary = {
    vigente: 0,
    rango1_30: 0,
    rango31_60: 0,
    rango61_90: 0,
    rangoMas90: 0,
    total: 0
  };

  receivables.forEach(r => {
    summary.total += r.balance;
    if (r.daysOverdue <= 0) summary.vigente += r.balance;
    else if (r.daysOverdue <= 30) summary.rango1_30 += r.balance;
    else if (r.daysOverdue <= 60) summary.rango31_60 += r.balance;
    else if (r.daysOverdue <= 90) summary.rango61_90 += r.balance;
    else summary.rangoMas90 += r.balance;
  });

  // NIIF 9 Modelo Pérdida Crediticia Esperada (PCE) con matriz de probabilidad de default
  const niifRates = {
    vigente: 0.01, // 1%
    rango1_30: 0.03, // 3%
    rango31_60: 0.08, // 8%
    rango61_90: 0.20, // 20%
    rangoMas90: 0.50 // 50%
  };

  const niifPceTotal = Math.round(
    summary.vigente * niifRates.vigente +
    summary.rango1_30 * niifRates.rango1_30 +
    summary.rango31_60 * niifRates.rango31_60 +
    summary.rango61_90 * niifRates.rango61_90 +
    summary.rangoMas90 * niifRates.rangoMas90
  );

  // Fiscal General (Decreto 187 de 1975)
  // 5% (90 a 180 días), 10% (181 a 360 días), 15% (> 360 días)
  const fiscalGeneralTotal = Math.round(summary.rangoMas90 * 0.15);

  return {
    summary,
    niifRates,
    niifPceTotal,
    fiscalGeneralTotal
  };
}

// 3. GENERADOR INTEGRAL DEL LIBRO DIARIO (Partida Doble)
export function buildMasterJournalEntries(
  partners: OpeningPartnerContribution[],
  kardex: KardexEntry[],
  receivables: ClientReceivable[],
  payrollRows: PayrollRowCalculation[],
  contingencies: ContingentProvision[],
  adjustments: AdjustmentItem[],
  niifPceImpairment: number
): JournalEntry[] {
  const entries: JournalEntry[] = [];

  // 1. Asiento de Apertura
  const totalCash = partners.reduce((s, p) => s + p.cashContribution, 0);
  const totalInv = partners.reduce((s, p) => s + p.inventoryContribution, 0);
  const totalEquip = partners.reduce((s, p) => s + p.equipmentContribution, 0);
  const totalProp = partners.reduce((s, p) => s + p.propertyContribution, 0);
  const totalCapital = partners.reduce((s, p) => s + p.netContribution, 0);

  const openingLines: JournalLine[] = [];
  if (totalCash > 0) {
    openingLines.push({ accountCode: '111005', accountName: 'Bancos Nacionales (Davivienda)', debit: totalCash, credit: 0, description: 'Aporte de capital en efectivo' });
  }
  if (totalInv > 0) {
    openingLines.push({ accountCode: '143505', accountName: 'Mercancías no Fabricadas por la Empresa', debit: totalInv, credit: 0, description: 'Aporte en inventario de tecnología' });
  }
  if (totalEquip > 0) {
    openingLines.push({ accountCode: '152805', accountName: 'Equipos de Procesamiento de Datos', debit: totalEquip, credit: 0, description: 'Aporte en servidores y computadores' });
  }
  if (totalProp > 0) {
    openingLines.push({ accountCode: '152405', accountName: 'Muebles y Enseres de Oficina', debit: totalProp, credit: 0, description: 'Aporte en mobiliario de oficina' });
  }
  openingLines.push({ accountCode: '310505', accountName: 'Capital Suscrito y Pagado', debit: 0, credit: totalCapital, description: 'Capital social según escritura / estatutos' });

  entries.push({
    id: 'asiento-01-apertura',
    date: '2026-03-01',
    concept: 'Asiento de Apertura y Constitución Legal de la Sociedad',
    sourceModule: 'CONSTITUCION',
    lines: openingLines
  });

  // 2. Asientos del Kardex (Compras, Ventas y Costo de Ventas)
  kardex.forEach((k, idx) => {
    if (k.type === 'COMPRA') {
      const iva = Math.round(k.inTotal * 0.19);
      const totalFactura = k.inTotal + iva;
      entries.push({
        id: `asiento-compra-${idx}`,
        date: k.date,
        concept: `Compra de mercancía según ${k.documentRef}`,
        sourceModule: 'INVENTARIO',
        lines: [
          { accountCode: '143505', accountName: 'Inventarios - Mercancías no Fabricadas', debit: k.inTotal, credit: 0, description: 'Ingreso a bodega al costo' },
          { accountCode: '240810', accountName: 'IVA Descontable en Compras (19%)', debit: iva, credit: 0, description: 'Impuesto sobre las ventas pagado' },
          { accountCode: '220505', accountName: 'Proveedores Nacionales', debit: 0, credit: totalFactura, description: 'Causación de cuenta por pagar a proveedor' }
        ]
      });
    } else if (k.type === 'VENTA') {
      // Venta a precio comercial (estimado con base en cartera o margen)
      const ventaBruta = Math.round(k.outTotal * 1.55); // margen educativo estándar
      const ivaGenerado = Math.round(ventaBruta * 0.19);
      const totalCliente = ventaBruta + ivaGenerado;

      entries.push({
        id: `asiento-venta-${idx}`,
        date: k.date,
        concept: `Facturación de Venta a Crédito según ${k.documentRef}`,
        sourceModule: 'CARTERA',
        lines: [
          { accountCode: '130505', accountName: 'Clientes Nacionales (Cuentas por Cobrar)', debit: totalCliente, credit: 0, description: 'Facturación a crédito' },
          { accountCode: '413536', accountName: 'Ingresos Operacionales - Venta Equipos Cómputo', debit: 0, credit: ventaBruta, description: 'Reconocimiento del ingreso ordinario NIIF 15' },
          { accountCode: '240805', accountName: 'IVA Generado en Ventas (19%)', debit: 0, credit: ivaGenerado, description: 'Impuesto a las ventas liquidado' }
        ]
      });

      // Asiento del Costo de Ventas
      entries.push({
        id: `asiento-costo-${idx}`,
        date: k.date,
        concept: `Reconocimiento del Costo de Ventas según ${k.documentRef}`,
        sourceModule: 'INVENTARIO',
        lines: [
          { accountCode: '613536', accountName: 'Costo de Ventas - Comercio al por Mayor', debit: k.outTotal, credit: 0, description: 'Costo de mercancía vendida según Kardex' },
          { accountCode: '143505', accountName: 'Inventarios - Salida de Bodega', debit: 0, credit: k.outTotal, description: 'Descargue de inventarios al costo promedio' }
        ]
      });
    }
  });

  // 3. Asiento de Recaudo de Cartera Parcial
  const totalRecaudos = receivables.reduce((s, r) => s + r.collectedAmount, 0);
  if (totalRecaudos > 0) {
    entries.push({
      id: 'asiento-recaudo-cartera',
      date: '2026-03-25',
      concept: 'Recaudo Parcial de Facturas de Clientes mediante Transferencia',
      sourceModule: 'CARTERA',
      lines: [
        { accountCode: '111005', accountName: 'Bancos Nacionales', debit: totalRecaudos, credit: 0, description: 'Ingreso bancario por recaudo de clientes' },
        { accountCode: '130505', accountName: 'Clientes Nacionales', debit: 0, credit: totalRecaudos, description: 'Abono a cuentas por cobrar' }
      ]
    });
  }

  // 4. Asiento de Nómina Consolidada
  if (payrollRows.length > 0) {
    const totDevengado = payrollRows.reduce((s, r) => s + r.totalDevengado, 0);
    const totSaludTrabajador = payrollRows.reduce((s, r) => s + r.healthWorker, 0);
    const totPensionTrabajador = payrollRows.reduce((s, r) => s + r.pensionWorker, 0);
    const totOtrasDeducciones = payrollRows.reduce((s, r) => s + r.employee.otherDeductions, 0);
    const totNetoPagar = payrollRows.reduce((s, r) => s + r.netPayableWorker, 0);

    const totSaludPatrono = payrollRows.reduce((s, r) => s + r.healthEmployer, 0);
    const totPensionPatrono = payrollRows.reduce((s, r) => s + r.pensionEmployer, 0);
    const totArl = payrollRows.reduce((s, r) => s + r.arlEmployer, 0);
    const totParafiscales = payrollRows.reduce((s, r) => s + r.sena + r.icbf + r.cajaCompensacion, 0);

    const totCesantias = payrollRows.reduce((s, r) => s + r.cesantias, 0);
    const totIntereses = payrollRows.reduce((s, r) => s + r.interesesCesantias, 0);
    const totPrima = payrollRows.reduce((s, r) => s + r.primaServicios, 0);
    const totVacaciones = payrollRows.reduce((s, r) => s + r.vacaciones, 0);

    const totalGastoSeguridadSocial = totSaludPatrono + totPensionPatrono + totArl;
    const totalGastoPrestaciones = totCesantias + totIntereses + totPrima + totVacaciones;

    entries.push({
      id: 'asiento-nomina-mensual',
      date: '2026-03-31',
      concept: 'Causación de Nómina Mensual, Seguridad Social Patronal, Parafiscales y Prestaciones Sociales',
      sourceModule: 'NOMINA',
      lines: [
        // Gasto Sueldos y Devengados
        { accountCode: '510506', accountName: 'Gasto Sueldos y Horas Extras Personal', debit: totDevengado, credit: 0, description: 'Total devengado laboral del mes' },
        { accountCode: '510568', accountName: 'Gasto Aportes Seguridad Social Patronal (Salud/Pensión/ARL)', debit: totalGastoSeguridadSocial, credit: 0, description: 'Aportes a la seguridad social a cargo del empleador' },
        { accountCode: '510570', accountName: 'Gasto Aportes Parafiscales (SENA, ICBF, Caja)', debit: totParafiscales, credit: 0, description: 'Aportes parafiscales obligatorios' },
        { accountCode: '510530', accountName: 'Gasto Prestaciones Sociales (Cesantías, Intereses, Prima, Vacaciones)', debit: totalGastoPrestaciones, credit: 0, description: 'Provisión mensual de prestaciones sociales' },
        
        // Pasivos Laborales y Retenciones
        { accountCode: '250505', accountName: 'Salarios por Pagar (Nómina Neta a Empleados)', debit: 0, credit: totNetoPagar, description: 'Neto a consignar a empleados' },
        { accountCode: '237005', accountName: 'Aportes a Entidades Promotoras de Salud (EPS)', debit: 0, credit: totSaludTrabajador + totSaludPatrono, description: 'Aporte salud trabajador (4%) + patronal (8.5%)' },
        { accountCode: '238030', accountName: 'Fondos de Pensiones y Cesantías por Pagar', debit: 0, credit: totPensionTrabajador + totPensionPatrono, description: 'Aporte pensión trabajador (4%) + patronal (12%)' },
        { accountCode: '237006', accountName: 'Administradoras de Riesgos Laborales (ARL)', debit: 0, credit: totArl, description: 'Aporte ARL según nivel de riesgo' },
        { accountCode: '237010', accountName: 'Parafiscales por Pagar (Caja, SENA, ICBF)', debit: 0, credit: totParafiscales, description: 'Aportes parafiscales causados' },
        { accountCode: '261005', accountName: 'Provisión para Cesantías e Intereses', debit: 0, credit: totCesantias + totIntereses, description: 'Pasivo estimado de cesantías e intereses' },
        { accountCode: '261020', accountName: 'Provisión para Prima de Servicios', debit: 0, credit: totPrima, description: 'Pasivo estimado prima semestral' },
        { accountCode: '261015', accountName: 'Provisión para Vacaciones', debit: 0, credit: totVacaciones, description: 'Pasivo estimado vacaciones' },
        ...(totOtrasDeducciones > 0 ? [{ accountCode: '237095', accountName: 'Otras Retenciones de Nómina / Cooperativas', debit: 0, credit: totOtrasDeducciones, description: 'Deducciones autorizadas por el trabajador' }] : [])
      ]
    });
  }

  // 5. Asiento de Deterioro de Cartera (NIIF 9)
  if (niifPceImpairment > 0) {
    entries.push({
      id: 'asiento-deterioro-cartera',
      date: '2026-03-31',
      concept: 'Reconocimiento del Deterioro de Cuentas por Cobrar (PCE bajo NIIF 9)',
      sourceModule: 'PROVISION',
      lines: [
        { accountCode: '519910', accountName: 'Gasto por Deterioro de Cartera (NIIF 9)', debit: niifPceImpairment, credit: 0, description: 'Pérdida crediticia esperada del periodo' },
        { accountCode: '139905', accountName: 'Deterioro Acumulado de Clientes (Cuenta de Valuación)', debit: 0, credit: niifPceImpairment, description: 'Menor valor del activo financiero' }
      ]
    });
  }

  // 6. Asiento de Provisiones Contingentes (NIC 37)
  const contingenciasReconocidas = contingencies.filter(c => c.recognizedAsLiability);
  const totalContingencias = contingenciasReconocidas.reduce((s, c) => s + c.estimatedAmount, 0);
  if (totalContingencias > 0) {
    entries.push({
      id: 'asiento-provisiones-contingentes',
      date: '2026-03-31',
      concept: 'Reconocimiento de Pasivos Estimados y Provisiones (NIC 37)',
      sourceModule: 'PROVISION',
      lines: [
        { accountCode: '531520', accountName: 'Gasto Extraordinario por Provisiones Litigios y Garantías', debit: totalContingencias, credit: 0, description: 'Estimación técnica de contingencias probables' },
        { accountCode: '263505', accountName: 'Provisiones para Litigios y Demandas (Pasivo)', debit: 0, credit: totalContingencias, description: 'Pasivo contingente reconocido en el ESF' }
      ]
    });
  }

  // 7. Asientos de Ajustes (Depreciaciones y Gastos Diferidos)
  adjustments.filter(a => a.applied).forEach((adj, idx) => {
    if (adj.type === 'DEPRECIACION') {
      const isComputer = adj.assetName.toLowerCase().includes('cómputo') || adj.assetName.toLowerCase().includes('servidor');
      const creditAccCode = isComputer ? '159220' : '159215';
      const creditAccName = isComputer ? 'Depreciación Acumulada Equipos de Cómputo' : 'Depreciación Acumulada Muebles y Enseres';

      entries.push({
        id: `asiento-depreciacion-${idx}`,
        date: '2026-03-31',
        concept: `Ajuste Contable Mensual por Depreciación: ${adj.assetName}`,
        sourceModule: 'AJUSTE',
        lines: [
          { accountCode: '516015', accountName: 'Gasto Depreciación Propiedad, Planta y Equipo', debit: adj.calculatedAmount, credit: 0, description: adj.description },
          { accountCode: creditAccCode, accountName: creditAccName, debit: 0, credit: adj.calculatedAmount, description: 'Cuenta correctora del activo no corriente' }
        ]
      });
    } else if (adj.type === 'GASTO_ANTICIPADO') {
      entries.push({
        id: `asiento-amortizacion-${idx}`,
        date: '2026-03-31',
        concept: `Ajuste por Amortización de Diferidos: ${adj.assetName}`,
        sourceModule: 'AJUSTE',
        lines: [
          { accountCode: '513005', accountName: 'Gasto Operacional Seguros Generales', debit: adj.calculatedAmount, credit: 0, description: adj.description },
          { accountCode: '170505', accountName: 'Gastos Pagados por Anticipado - Seguros', debit: 0, credit: adj.calculatedAmount, description: 'Amortización de la póliza diferida' }
        ]
      });
    }
  });

  return entries;
}

// 4. BALANZA DE COMPROBACIÓN (Trial Balance)
export interface TrialBalanceItem {
  code: string;
  name: string;
  debit: number;
  credit: number;
  balanceDebit: number;
  balanceCredit: number;
  classType: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESOS' | 'GASTOS' | 'COSTOS';
}

export function computeTrialBalance(entries: JournalEntry[]): {
  items: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  difference: number;
} {
  const map: Record<string, { code: string; name: string; debit: number; credit: number }> = {};

  entries.forEach(entry => {
    entry.lines.forEach(line => {
      if (!map[line.accountCode]) {
        map[line.accountCode] = {
          code: line.accountCode,
          name: line.accountName,
          debit: 0,
          credit: 0
        };
      }
      map[line.accountCode].debit += line.debit;
      map[line.accountCode].credit += line.credit;
    });
  });

  const sortedKeys = Object.keys(map).sort();
  let totalDebits = 0;
  let totalCredits = 0;

  const items: TrialBalanceItem[] = sortedKeys.map(code => {
    const raw = map[code];
    totalDebits += raw.debit;
    totalCredits += raw.credit;

    const firstDigit = code.charAt(0);
    let classType: TrialBalanceItem['classType'] = 'ACTIVO';
    if (firstDigit === '2') classType = 'PASIVO';
    else if (firstDigit === '3') classType = 'PATRIMONIO';
    else if (firstDigit === '4') classType = 'INGRESOS';
    else if (firstDigit === '5') classType = 'GASTOS';
    else if (firstDigit === '6' || firstDigit === '7') classType = 'COSTOS';

    // Saldo según naturaleza: Activo (1), Gastos (5), Costos (6) Débito por defecto
    const isDebitNature = ['1', '5', '6', '7'].includes(firstDigit);
    let balanceDebit = 0;
    let balanceCredit = 0;

    if (isDebitNature) {
      const net = raw.debit - raw.credit;
      if (net >= 0) balanceDebit = net;
      else balanceCredit = Math.abs(net);
    } else {
      const net = raw.credit - raw.debit;
      if (net >= 0) balanceCredit = net;
      else balanceDebit = Math.abs(net);
    }

    return {
      code: raw.code,
      name: raw.name,
      debit: raw.debit,
      credit: raw.credit,
      balanceDebit,
      balanceCredit,
      classType
    };
  });

  const difference = Math.abs(totalDebits - totalCredits);
  const isBalanced = difference < 1;

  return {
    items,
    totalDebits,
    totalCredits,
    isBalanced,
    difference
  };
}

// 5. ESTADOS FINANCIEROS Y NOTAS EXPLICATIVAS
export interface FinancialStatementsResult {
  // Estado de Resultados
  incomeStatement: {
    grossRevenue: number;
    salesReturns: number;
    netRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    administrativeExpenses: number;
    sellingExpenses: number;
    impairmentExpense: number;
    contingencyExpense: number;
    totalOperatingExpenses: number;
    operatingIncome: number; // EBITDA / EBIT
    financialExpenses: number;
    incomeBeforeTax: number;
    incomeTaxProvision: number;
    netIncome: number;
  };
  // Estado de Situación Financiera
  balanceSheet: {
    currentAssets: {
      cashAndEquivalents: number;
      tradeReceivablesGross: number;
      receivablesImpairment: number;
      tradeReceivablesNet: number;
      inventories: number;
      prepaidExpenses: number;
      taxAssets: number; // IVA descontable
      totalCurrentAssets: number;
    };
    nonCurrentAssets: {
      propertyPlantEquipmentGross: number;
      accumulatedDepreciation: number;
      propertyPlantEquipmentNet: number;
      intangibles: number;
      totalNonCurrentAssets: number;
    };
    totalAssets: number;
    currentLiabilities: {
      tradePayables: number;
      payrollAndSocialSecurityPayable: number;
      taxesPayable: number; // IVA generado
      provisionsEmployeeBenefits: number;
      totalCurrentLiabilities: number;
    };
    nonCurrentLiabilities: {
      contingentProvisions: number;
      longTermDebt: number;
      totalNonCurrentLiabilities: number;
    };
    totalLiabilities: number;
    equity: {
      subscribedAndPaidCapital: number;
      retainedEarnings: number;
      currentPeriodNetIncome: number;
      legalReserve: number;
      totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
    equationDifference: number;
    isBalanced: boolean;
  };
  // Estado de Flujos de Efectivo
  cashFlow: {
    operatingActivities: {
      collectionsFromCustomers: number;
      paymentsToSuppliers: number;
      paymentsToEmployeesAndSecurity: number;
      netOperatingCash: number;
    };
    investingActivities: {
      purchaseOfEquipment: number;
      netInvestingCash: number;
    };
    financingActivities: {
      initialCapitalContributionsCash: number;
      netFinancingCash: number;
    };
    netCashChange: number;
    initialCash: number;
    finalCashCalculated: number;
  };
  // 12 Notas Explicativas bajo NIIF
  notes: FinancialNote[];
}

export function generateFinancialStatements(
  company: CompanyProfile,
  entries: JournalEntry[],
  trialBalance: ReturnType<typeof computeTrialBalance>
): FinancialStatementsResult {
  const getNetBalance = (codePrefix: string) => {
    return trialBalance.items
      .filter(i => i.code.startsWith(codePrefix))
      .reduce((sum, i) => {
        const firstDigit = i.code.charAt(0);
        if (['1', '5', '6'].includes(firstDigit)) {
          return sum + (i.balanceDebit - i.balanceCredit);
        } else {
          return sum + (i.balanceCredit - i.balanceDebit);
        }
      }, 0);
  };

  // Cuentas Específicas
  const cashDavivienda = getNetBalance('1110');
  const receivablesGross = getNetBalance('1305');
  const impairmentCartera = Math.abs(getNetBalance('1399')); // contra-activo
  const receivablesNet = Math.max(0, receivablesGross - impairmentCartera);
  const inventories = getNetBalance('1435');
  const ivaDescontable = getNetBalance('240810');
  const prepaidExpenses = getNetBalance('1705');

  const totalCurrentAssets = cashDavivienda + receivablesNet + inventories + ivaDescontable + prepaidExpenses;

  const equipComputo = getNetBalance('1528');
  const mueblesEnseres = getNetBalance('1524');
  const ppeGross = equipComputo + mueblesEnseres;
  const depAcumComputo = Math.abs(getNetBalance('159220'));
  const depAcumMuebles = Math.abs(getNetBalance('159215'));
  const totalDepAcum = depAcumComputo + depAcumMuebles;
  const ppeNet = Math.max(0, ppeGross - totalDepAcum);

  const totalAssets = totalCurrentAssets + ppeNet;

  // Pasivos
  const tradePayables = getNetBalance('2205');
  const payrollNetPayable = getNetBalance('2505');
  const socialSecurityPayable = getNetBalance('2370') + getNetBalance('2380');
  const payrollAndSocialSecurity = payrollNetPayable + socialSecurityPayable;
  const ivaGenerado = getNetBalance('240805');
  const provisionsLabor = getNetBalance('2610');
  const totalCurrentLiabilities = tradePayables + payrollAndSocialSecurity + ivaGenerado + provisionsLabor;

  const contingentProvisions = getNetBalance('2635');
  const totalLiabilities = totalCurrentLiabilities + contingentProvisions;

  // Ingresos y Costos
  const grossRevenue = getNetBalance('4135');
  const costOfGoodsSold = getNetBalance('6135');
  const grossProfit = grossRevenue - costOfGoodsSold;

  // Gastos
  const expenseSalaries = getNetBalance('510506');
  const expenseSocialSec = getNetBalance('510568');
  const expenseParafiscal = getNetBalance('510570');
  const expensePrestaciones = getNetBalance('510530');
  const expenseDepreciation = getNetBalance('5160');
  const expenseInsurance = getNetBalance('5130');
  const administrativeExpenses = expenseSalaries + expenseSocialSec + expenseParafiscal + expensePrestaciones + expenseDepreciation + expenseInsurance;

  const impairmentExpense = getNetBalance('5199');
  const contingencyExpense = getNetBalance('5315');

  const totalOperatingExpenses = administrativeExpenses + impairmentExpense + contingencyExpense;
  const operatingIncome = grossProfit - totalOperatingExpenses;

  const incomeBeforeTax = operatingIncome;
  const incomeTaxProvision = incomeBeforeTax > 0 ? Math.round(incomeBeforeTax * CONSTANTS.TAX_INCOME_RATE) : 0;
  const netIncome = incomeBeforeTax - incomeTaxProvision;

  // Patrimonio
  const capitalPaid = getNetBalance('3105');
  const legalReserve = netIncome > 0 ? Math.round(netIncome * 0.10) : 0; // 10% reserva legal
  const retainedEarnings = netIncome - legalReserve;
  const totalEquity = capitalPaid + retainedEarnings + legalReserve;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + incomeTaxProvision;
  const equationDifference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = equationDifference < 2;

  // Flujo de Efectivo
  const collectionsFromCustomers = trialBalance.items.find(i => i.code === '130505')?.credit || 0;
  const initialCapitalCash = trialBalance.items.find(i => i.code === '111005')?.debit || 0;
  const netOperatingCash = collectionsFromCustomers;
  const netFinancingCash = initialCapitalCash - collectionsFromCustomers;

  const cashFlow = {
    operatingActivities: {
      collectionsFromCustomers,
      paymentsToSuppliers: 0,
      paymentsToEmployeesAndSecurity: 0,
      netOperatingCash
    },
    investingActivities: {
      purchaseOfEquipment: 0,
      netInvestingCash: 0
    },
    financingActivities: {
      initialCapitalContributionsCash: netFinancingCash,
      netFinancingCash
    },
    netCashChange: cashDavivienda,
    initialCash: 0,
    finalCashCalculated: cashDavivienda
  };

  // 12 NOTAS EXPLICATIVAS DOCENTES
  const notes: FinancialNote[] = [
    {
      number: 1,
      title: 'Entidad que Reporta y Objeto Social',
      standardReference: 'NIIF para las PYMES Sección 3 / NIC 1',
      content: `${company.name}, identificada con NIT ${company.nit}, es una sociedad comercial constituida mediante documento privado el 01 de marzo de 2026 en ${company.city}, bajo la tipología jurídica de Sociedad por Acciones Simplificada (S.A.S.), regulada por la Ley 1258 de 2008. Su objeto social principal corresponde a la actividad CIIU ${company.economicActivityCode}: "${company.activityDescription}". La compañía tiene domicilio principal en Colombia y su vigencia es indefinida.`
    },
    {
      number: 2,
      title: 'Bases de Preparación y Políticas Contables Significativas',
      standardReference: 'Marco Técnico Normativo Grupo 2 (Decreto 2420 de 2015)',
      content: `Los presentes estados financieros han sido preparados de acuerdo con las Normas de Información Financiera para Pequeñas y Medianas Entidades (NIIF para las PYMES). La base de medición es el costo histórico con ajustes por deterioro del valor en los activos que lo requieren. La entidad utiliza la moneda funcional y de presentación Peso Colombiano (COP). Se aplica el principio de causación o devengo contable y la hipótesis de negocio en marcha.`
    },
    {
      number: 3,
      title: 'Efectivo y Equivalentes de Efectivo',
      standardReference: 'NIIF para las PYMES Sección 7 / NIC 7',
      content: `Comprende los recursos de liquidez inmediata depositados en cuentas bancarias comerciales del sistema financiero vigilado en Colombia. No existen restricciones sobre la disponibilidad de los fondos a la fecha de corte.`,
      breakdownTable: {
        headers: ['Concepto / Entidad Financiera', 'Valor COP'],
        rows: [
          ['Banco Davivienda - Cuenta Corriente Empresarial', formatCurrency(cashDavivienda)],
          ['Caja General y Menor', formatCurrency(0)]
        ],
        totalLabel: 'Total Efectivo y Equivalentes',
        totalValue: formatCurrency(cashDavivienda)
      }
    },
    {
      number: 4,
      title: 'Deudores Comerciales y Deterioro de Cartera',
      standardReference: 'NIIF 9 / NIIF para las PYMES Sección 11 (Instrumentos Financieros)',
      content: `Las cuentas por cobrar comerciales corresponden a derechos de cobro originados en la venta a crédito de tecnología con plazos habituales de 30 a 60 días. El deterioro del valor se reconoce mediante el modelo de Pérdida Crediticia Esperada (PCE), estimando la probabilidad de incumplimiento según la antigüedad de la cartera vencida.`,
      breakdownTable: {
        headers: ['Rubro', 'Valor COP'],
        rows: [
          ['Clientes Nacionales (Saldo Bruto en Libros)', formatCurrency(receivablesGross)],
          ['Menos: Deterioro Acumulado de Cartera (NIIF 9)', `(${formatCurrency(impairmentCartera)})`],
          ['Saldo Neto en Libros Reconocido', formatCurrency(receivablesNet)]
        ],
        totalLabel: 'Total Deudores Comerciales Netos',
        totalValue: formatCurrency(receivablesNet)
      }
    },
    {
      number: 5,
      title: 'Inventarios y Fórmula del Costo',
      standardReference: 'NIIF para las PYMES Sección 13 / NIC 2',
      content: `Los inventarios de mercancías no fabricadas por la empresa se miden al menor valor entre el costo de adquisición y el valor neto realizable (VNR). La fórmula de costeo utilizada en los registros del Kardex permanente es el Método del Promedio Ponderado móvil, incluyendo el costo de compra y fletes directos, deduciendo descuentos comerciales.`,
      breakdownTable: {
        headers: ['Categoría de Inventario', 'Valor COP'],
        rows: [
          ['Equipos de Cómputo Portátiles para Venta', formatCurrency(18300000)],
          ['Servidores Rack y Componentes', formatCurrency(5000000)]
        ],
        totalLabel: 'Total Inventarios en Bodega',
        totalValue: formatCurrency(inventories)
      }
    },
    {
      number: 6,
      title: 'Propiedades, Planta y Equipo y Depreciación Acumulada',
      standardReference: 'NIIF para las PYMES Sección 17 / NIC 16',
      content: `Los elementos de propiedad, planta y equipo se registran al costo de adquisición menos la depreciación acumulada y cualquier pérdida por deterioro. La depreciación se calcula linealmente a lo largo de las vidas útiles estimadas: Equipos de Cómputo (5 años / 60 meses, valor residual 10%) y Muebles y Enseres (10 años / 120 meses, valor residual 10%).`,
      breakdownTable: {
        headers: ['Clasificación del Activo', 'Costo Histórico', 'Depreciación Acumulada', 'Valor Neto en Libros'],
        rows: [
          ['Equipos de Cómputo y Servidores', formatCurrency(equipComputo), `(${formatCurrency(depAcumComputo)})`, formatCurrency(equipComputo - depAcumComputo)],
          ['Muebles y Enseres de Oficina', formatCurrency(mueblesEnseres), `(${formatCurrency(depAcumMuebles)})`, formatCurrency(mueblesEnseres - depAcumMuebles)]
        ],
        totalLabel: 'Total Propiedad, Planta y Equipo Neto',
        totalValue: formatCurrency(ppeNet)
      }
    },
    {
      number: 7,
      title: 'Cuentas Comerciales por Pagar y Proveedores',
      standardReference: 'NIIF para las PYMES Sección 11',
      content: `Refleja las obligaciones financieras originadas por compras de mercancía a distribuidores mayoristas con condiciones comerciales a 30 días sin intereses implícitos significativos.`,
      breakdownTable: {
        headers: ['Tercero Acreedor', 'Concepto', 'Saldo COP'],
        rows: [
          ['TechWholesale Mayorista', 'Factura de Compra FC-1049 (Inventario)', formatCurrency(tradePayables)]
        ],
        totalLabel: 'Total Proveedores Nacionales',
        totalValue: formatCurrency(tradePayables)
      }
    },
    {
      number: 8,
      title: 'Beneficios a los Empleados (Pasivos Laborales)',
      standardReference: 'NIIF para las PYMES Sección 28 / NIC 19',
      content: `Comprende los beneficios a corto plazo otorgados a los trabajadores vinculados mediante contrato de trabajo a término indefinido: salarios pendientes de pago, aportes al Sistema de Seguridad Social Integral (EPS, AFP, ARL), Parafiscales y provisiones consolidadas para prestaciones sociales (Cesantías 8.33%, Intereses sobre cesantías 1%, Prima de servicios 8.33% y Vacaciones 4.16%).`,
      breakdownTable: {
        headers: ['Concepto Laboral', 'Valor COP'],
        rows: [
          ['Nómina Neta por Pagar a Colaboradores', formatCurrency(payrollNetPayable)],
          ['Aportes Seguridad Social Patronal y Trabajador (EPS/AFP/ARL)', formatCurrency(socialSecurityPayable)],
          ['Provisiones para Prestaciones Sociales (Cesantías, Prima, Vacaciones)', formatCurrency(provisionsLabor)]
        ],
        totalLabel: 'Total Obligaciones Laborales y Prestacionales',
        totalValue: formatCurrency(payrollAndSocialSecurity + provisionsLabor)
      }
    },
    {
      number: 9,
      title: 'Provisiones, Pasivos Contingentes y Compromisos',
      standardReference: 'NIIF para las PYMES Sección 21 / NIC 37',
      content: `Se reconocen como pasivos en el balance cuando la entidad tiene una obligación presente producto de un suceso pasado, cuya liquidación requiere una salida de recursos y la cuantía puede ser estimada con fiabilidad. Se reconoce una provisión por litigio laboral ordinario y una estimación de soporte y garantía de productos vendidos.`,
      breakdownTable: {
        headers: ['Tipo de Contingencia', 'Probabilidad NIIF', 'Monto Estimado'],
        rows: [
          ['Litigio laboral reclamación contrato realidad', 'Probable (>50%)', formatCurrency(7500000)],
          ['Fondo de soporte y garantías técnicas', 'Probable (>50%)', formatCurrency(2000000)]
        ],
        totalLabel: 'Total Pasivos Estimados y Provisiones',
        totalValue: formatCurrency(contingentProvisions)
      }
    },
    {
      number: 10,
      title: 'Capital Emitido y Patrimonio de los Accionistas',
      standardReference: 'NIIF para las PYMES Sección 22',
      content: `El capital autorizado de la compañía es de ${formatCurrency(company.capitalAuthorized)}, conformado por 15.000 acciones ordinarias de valor nominal $10.000 cada una. El capital suscrito y pagado es de ${formatCurrency(company.capitalPaid)}, representado en 10.000 acciones íntegramente liberadas en especie y dinero por los 3 socios fundadores en el acta de constitución.`,
      breakdownTable: {
        headers: ['Accionista / Socio', 'No. Acciones', 'Participación %', 'Aporte Total COP'],
        rows: [
          ['Carlos Mendoza Restrepo', '4.000', '40.0%', formatCurrency(40000000)],
          ['Mariana Duarte Silva', '3.000', '30.0%', formatCurrency(30000000)],
          ['Inversiones Omega Ltda.', '3.000', '30.0%', formatCurrency(30000000)]
        ],
        totalLabel: 'Total Capital Social Suscrito y Pagado',
        totalValue: formatCurrency(capitalPaid)
      }
    },
    {
      number: 11,
      title: 'Ingresos de Actividades Ordinarias y Costo de Ventas',
      standardReference: 'NIIF 15 / NIIF para las PYMES Sección 23',
      content: `Los ingresos ordinarios se reconocen cuando se transfiere el control de los bienes tecnológicos a los clientes corporativos conforme al contrato pactado y se emite la respectiva factura electrónica de venta validada por la DIAN. El margen bruto operativo del ejercicio equivale a un ${formatNumber((grossProfit / (grossRevenue || 1)) * 100, 1)}%.`,
      breakdownTable: {
        headers: ['Concepto', 'Valor COP'],
        rows: [
          ['Ingresos Brutos por Venta de Computadores y Servidores', formatCurrency(grossRevenue)],
          ['Menos: Costo de Ventas según Kardex Promedio', `(${formatCurrency(costOfGoodsSold)})`],
          ['Utilidad Bruta en Ventas', formatCurrency(grossProfit)]
        ],
        totalLabel: 'Margen Bruto Obtenido',
        totalValue: `${formatNumber((grossProfit / (grossRevenue || 1)) * 100, 1)}%`
      }
    },
    {
      number: 12,
      title: 'Impuesto sobre la Renta y Obligaciones Fiscales',
      standardReference: 'NIIF para las PYMES Sección 29 / Estatuto Tributario Art. 240',
      content: `El impuesto sobre la renta corriente se calcula aplicando la tarifa general del 35% sobre la renta líquida gravable fiscal depurada. La provisión de renta corriente estimada para el periodo asciende a ${formatCurrency(incomeTaxProvision)}. La compañía es responsable del Impuesto sobre las Ventas (IVA 19%) y agente retenedor a título de renta.`
    }
  ];

  return {
    incomeStatement: {
      grossRevenue,
      salesReturns: 0,
      netRevenue: grossRevenue,
      costOfGoodsSold,
      grossProfit,
      administrativeExpenses,
      sellingExpenses: 0,
      impairmentExpense,
      contingencyExpense,
      totalOperatingExpenses,
      operatingIncome,
      financialExpenses: 0,
      incomeBeforeTax,
      incomeTaxProvision,
      netIncome
    },
    balanceSheet: {
      currentAssets: {
        cashAndEquivalents: cashDavivienda,
        tradeReceivablesGross: receivablesGross,
        receivablesImpairment: impairmentCartera,
        tradeReceivablesNet: receivablesNet,
        inventories,
        prepaidExpenses,
        taxAssets: ivaDescontable,
        totalCurrentAssets
      },
      nonCurrentAssets: {
        propertyPlantEquipmentGross: ppeGross,
        accumulatedDepreciation: totalDepAcum,
        propertyPlantEquipmentNet: ppeNet,
        intangibles: 0,
        totalNonCurrentAssets: ppeNet
      },
      totalAssets,
      currentLiabilities: {
        tradePayables,
        payrollAndSocialSecurityPayable: payrollAndSocialSecurity,
        taxesPayable: ivaGenerado,
        provisionsEmployeeBenefits: provisionsLabor,
        totalCurrentLiabilities
      },
      nonCurrentLiabilities: {
        contingentProvisions,
        longTermDebt: 0,
        totalNonCurrentLiabilities: contingentProvisions
      },
      totalLiabilities,
      equity: {
        subscribedAndPaidCapital: capitalPaid,
        retainedEarnings,
        currentPeriodNetIncome: netIncome,
        legalReserve,
        totalEquity
      },
      totalLiabilitiesAndEquity,
      equationDifference,
      isBalanced
    },
    cashFlow,
    notes
  };
}
