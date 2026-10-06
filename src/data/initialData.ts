import {
  CompanyProfile,
  OpeningPartnerContribution,
  InventoryItem,
  KardexEntry,
  ClientReceivable,
  Employee,
  AdjustmentItem,
  ContingentProvision
} from '../types/accounting';

export const CONSTANTS = {
  SMMLV: 1423500, // Salario mínimo legal
  AUX_TRANSPORTE: 200000, // Auxilio de transporte legal
  ARL_RATES: {
    1: 0.00522, // Riesgo I
    2: 0.01044, // Riesgo II
    3: 0.02436, // Riesgo III
    4: 0.04350, // Riesgo IV
    5: 0.06960, // Riesgo V
  },
  HEALTH_WORKER: 0.04,
  PENSION_WORKER: 0.04,
  HEALTH_EMPLOYER: 0.085,
  PENSION_EMPLOYER: 0.12,
  SENA: 0.02,
  ICBF: 0.03,
  CAJA_COMPENSACION: 0.04,
  CESANTIAS: 0.08333,
  INTERESES_CESANTIAS: 0.01,
  PRIMA_SERVICIOS: 0.08333,
  VACACIONES: 0.04166,
  TAX_INCOME_RATE: 0.35, // 35% Impuesto de renta corporativo
};

export const INITIAL_LEGAL_STEPS = [
  {
    id: 'step-1',
    number: 1,
    title: 'Consulta de Homonimia y Uso de Suelo',
    entity: 'RUES / Cámara de Comercio',
    description: 'Verificación previa en el Registro Único Empresarial y Social para constatar que el nombre propuesto no coincida ni se preste a confusión con otra razón social ya registrada.',
    lawReference: 'Código de Comercio Art. 583; Circular Externa 002 SIC',
    completed: true,
    notes: 'Nombre "INNOVATEC SOLUCIONES S.A.S." disponible y reservado.'
  },
  {
    id: 'step-2',
    number: 2,
    title: 'Elaboración y Firma de Estatutos Sociales',
    entity: 'Documento Privado / Notaría',
    description: 'Redacción del documento constitutivo que norma las facultades de accionistas, capital social autorizado/suscrito/pagado, órganos de gobierno y causales de disolución.',
    lawReference: 'Ley 1258 de 2008 Art. 5 (S.A.S. documento privado)',
    completed: true,
    notes: 'Aprobado por unanimidad de los 3 socios fundadores.'
  },
  {
    id: 'step-3',
    number: 3,
    title: 'Trámite del Pre-RUT y Formulario RUES',
    entity: 'DIAN (Portal Virtual)',
    description: 'Generación del formulario preliminar para trámite mercantil con la leyenda "Para trámite en Cámara de Comercio". Asigna el prefijo identificador tributario temporal.',
    lawReference: 'Estatuto Tributario Art. 555-2; Decreto 1625 de 2016',
    completed: true,
    notes: 'Formulario 001 con código de trámite mercantil activo.'
  },
  {
    id: 'step-4',
    number: 4,
    title: 'Matrícula Mercantil e Inscripción de Libros Oficiales',
    entity: 'Cámara de Comercio de la Jurisdicción',
    description: 'Radicación física o digital de estatutos, cédulas, Pre-RUT y pago del impuesto de registro. Inscripción electrónica de Libros de Actas y Accionistas.',
    lawReference: 'Código de Comercio Art. 28, 29; Ley 1429 de 2010',
    completed: true,
    notes: 'Matrícula No. 03492812 conferida. Certificado de Existencia y Representación disponible.'
  },
  {
    id: 'step-5',
    number: 5,
    title: 'Apertura de Cuenta Bancaria Comercial',
    entity: 'Entidad Financiera Vigilada (SFC)',
    description: 'Apertura de cuenta corriente o de ahorros a nombre de la persona jurídica para canalizar los aportes de capital y operaciones ordinarias.',
    lawReference: 'Circular Básica Jurídica Superfinanciera Parte I, Título II',
    completed: true,
    notes: 'Cuenta Corriente Empresarial abierta en Banco Davivienda.'
  },
  {
    id: 'step-6',
    number: 6,
    title: 'Formalización del RUT Definitivo',
    entity: 'DIAN',
    description: 'Presentación del certificado de existencia y certificación bancaria para remover la leyenda transitoria y fijar responsabilidades tributarias formales (IVA, Renta, Retención).',
    lawReference: 'Resolución DIAN 000052 de 2016',
    completed: true,
    notes: 'NIT 901.845.320-1 expedido. Responsabilidades: 05, 07, 14, 42, 48, 52.'
  },
  {
    id: 'step-7',
    number: 7,
    title: 'Afiliación al Sistema de Seguridad Social Integral',
    entity: 'EPS, AFP, ARL y Caja de Compensación (PILA)',
    description: 'Inscripción patronal en Administradora de Riesgos Laborales (ARL), Fondos de Pensiones, Empresas Promotoras de Salud y CCF para habilitar contratación laboral.',
    lawReference: 'Ley 100 de 1993; Decreto 1072 de 2015 (DUR Sector Trabajo)',
    completed: true,
    notes: 'ARL Positiva Riesgo I y II; Caja Compensación Compensar.'
  },
  {
    id: 'step-8',
    number: 8,
    title: 'Registro de Facturación Electrónica y Licencias Locales',
    entity: 'DIAN & Secretaría de Salud / Bomberos',
    description: 'Habilitación de numeración y software de Facturación Electrónica con validación previa de la DIAN, certificado bomberil y concepto de uso de suelo.',
    lawReference: 'Resolución DIAN 000042 de 2020; Ley 1801 de 2016 Art. 87',
    completed: true,
    notes: 'Habilitación en ambiente de producción exitosa.'
  }
];

export const INITIAL_COMPANY: CompanyProfile = {
  name: 'INNOVATEC SOLUCIONES S.A.S.',
  nit: '901.845.320-1',
  legalType: 'SAS',
  city: 'Bogotá D.C., Colombia',
  capitalAuthorized: 150000000,
  capitalSubscribed: 100000000,
  capitalPaid: 100000000,
  economicActivityCode: '4651',
  activityDescription: 'Comercio al por mayor de computadores, equipo periférico y programas de informática',
  taxRegime: 'Responsable de IVA',
  legalRepresentative: 'Dr. Carlos Mendoza Restrepo',
  idRepresentative: 'C.C. 79.432.881',
  fiscalAuditor: 'Dra. Valentina Gómez Nieto (T.P. 182390-T)',
  accountingStandard: 'NIIF_PYMES',
  legalSteps: INITIAL_LEGAL_STEPS
};

export const INITIAL_PARTNERS: OpeningPartnerContribution[] = [
  {
    id: 'socio-1',
    partnerName: 'Carlos Mendoza Restrepo',
    partnerDoc: 'C.C. 79.432.881',
    sharesOrQuotas: 4000,
    nominalValue: 10000,
    cashContribution: 40000000, // Efectivo en Bancos
    inventoryContribution: 0,
    equipmentContribution: 0,
    propertyContribution: 0,
    otherAssetsContribution: 0,
    liabilityAssumed: 0,
    netContribution: 40000000
  },
  {
    id: 'socio-2',
    partnerName: 'Mariana Duarte Silva',
    partnerDoc: 'C.C. 52.890.114',
    sharesOrQuotas: 3000,
    nominalValue: 10000,
    cashContribution: 0,
    inventoryContribution: 30000000, // Mercancías no fabricadas
    equipmentContribution: 0,
    propertyContribution: 0,
    otherAssetsContribution: 0,
    liabilityAssumed: 0,
    netContribution: 30000000
  },
  {
    id: 'socio-3',
    partnerName: 'Inversiones Omega Ltda.',
    partnerDoc: 'NIT 860.291.503-4',
    sharesOrQuotas: 3000,
    nominalValue: 10000,
    cashContribution: 0,
    inventoryContribution: 0,
    equipmentContribution: 22000000, // Equipos de cómputo y servidores
    propertyContribution: 8000000, // Muebles y enseres de oficina
    otherAssetsContribution: 0,
    liabilityAssumed: 0,
    netContribution: 30000000
  }
];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    code: 'INV-LAP-01',
    name: 'Laptop Corporativa ThinkPro 15" i7 16GB',
    category: 'Computadores Portátiles',
    unit: 'Unidad',
    initialStock: 10,
    initialUnitCost: 2000000,
    sellingPrice: 3100000
  },
  {
    id: 'item-2',
    code: 'INV-SRV-02',
    name: 'Servidor Torre Rack 1U 32GB Xeon',
    category: 'Infraestructura Servidores',
    unit: 'Unidad',
    initialStock: 2,
    initialUnitCost: 5000000,
    sellingPrice: 7800000
  }
];

export const INITIAL_KARDEX: KardexEntry[] = [
  {
    id: 'kardex-1',
    date: '2026-03-01',
    itemId: 'item-1',
    documentRef: 'Acta de Constitución No. 01',
    type: 'INVENTARIO_INICIAL',
    inQty: 10,
    inUnitCost: 2000000,
    inTotal: 20000000,
    outQty: 0,
    outUnitCost: 0,
    outTotal: 0,
    balanceQty: 10,
    balanceUnitCost: 2000000,
    balanceTotal: 20000000
  },
  {
    id: 'kardex-2',
    date: '2026-03-01',
    itemId: 'item-2',
    documentRef: 'Acta de Constitución No. 01',
    type: 'INVENTARIO_INICIAL',
    inQty: 2,
    inUnitCost: 5000000,
    inTotal: 10000000,
    outQty: 0,
    outUnitCost: 0,
    outTotal: 0,
    balanceQty: 2,
    balanceUnitCost: 5000000,
    balanceTotal: 10000000
  },
  {
    id: 'kardex-3',
    date: '2026-03-08',
    itemId: 'item-1',
    documentRef: 'Factura Compra FC-1049 (TechWholesale)',
    type: 'COMPRA',
    inQty: 5,
    inUnitCost: 2100000,
    inTotal: 10500000,
    outQty: 0,
    outUnitCost: 0,
    outTotal: 0,
    balanceQty: 15,
    balanceUnitCost: 2033333.33,
    balanceTotal: 30500000
  },
  {
    id: 'kardex-4',
    date: '2026-03-15',
    itemId: 'item-1',
    documentRef: 'Factura Venta FV-001 (Soluciones Beta SAS)',
    type: 'VENTA',
    inQty: 0,
    inUnitCost: 0,
    inTotal: 0,
    outQty: 6,
    outUnitCost: 2033333.33,
    outTotal: 12200000,
    balanceQty: 9,
    balanceUnitCost: 2033333.33,
    balanceTotal: 18300000
  },
  {
    id: 'kardex-5',
    date: '2026-03-22',
    itemId: 'item-2',
    documentRef: 'Factura Venta FV-002 (Constructora Gran Andes)',
    type: 'VENTA',
    inQty: 0,
    inUnitCost: 0,
    inTotal: 0,
    outQty: 1,
    outUnitCost: 5000000,
    outTotal: 5000000,
    balanceQty: 1,
    balanceUnitCost: 5000000,
    balanceTotal: 5000000
  }
];

export const INITIAL_RECEIVABLES: ClientReceivable[] = [
  {
    id: 'rec-1',
    invoiceNumber: 'FV-001',
    clientName: 'Soluciones Beta S.A.S.',
    clientNit: '900.741.229-3',
    issueDate: '2026-03-15',
    dueDate: '2026-04-14',
    termDays: 30,
    totalInvoice: 22134000, // 6 laptops @ 3.1M + 19% IVA = 18.6M + 3.534M
    collectedAmount: 10000000,
    balance: 12134000,
    daysOverdue: 0,
    agingBucket: 'VIGENTE'
  },
  {
    id: 'rec-2',
    invoiceNumber: 'FV-002',
    clientName: 'Constructora Gran Andes Ltda.',
    clientNit: '830.119.458-7',
    issueDate: '2026-03-22',
    dueDate: '2026-04-21',
    termDays: 30,
    totalInvoice: 9282000, // 1 servidor @ 7.8M + 19% IVA
    collectedAmount: 0,
    balance: 9282000,
    daysOverdue: 0,
    agingBucket: 'VIGENTE'
  },
  {
    id: 'rec-3',
    invoiceNumber: 'FV-PREV-89',
    clientName: 'Distribuidora del Llano S.A.',
    clientNit: '800.223.111-9',
    issueDate: '2025-11-10',
    dueDate: '2025-12-10',
    termDays: 30,
    totalInvoice: 6500000,
    collectedAmount: 2000000,
    balance: 4500000,
    daysOverdue: 116,
    agingBucket: 'MAS_90'
  }
];

export const INITIAL_CONTINGENCIES: ContingentProvision[] = [
  {
    id: 'cont-1',
    type: 'LITIGIO_LABORAL',
    description: 'Demanda ordinaria laboral interpuesta por ex-contratista reclamando contrato realidad y prestaciones sociales.',
    estimatedAmount: 7500000,
    probability: 'PROBABLE',
    recognizedAsLiability: true,
    accountingStandard: 'NIC 37 Provisiones, Pasivos Contingentes y Activos Contingentes'
  },
  {
    id: 'cont-2',
    type: 'GARANTIA_PRODUCTO',
    description: 'Fondo estimado para soporte técnico posventa y reemplazo de partes con garantía de fábrica de 12 meses.',
    estimatedAmount: 2000000,
    probability: 'PROBABLE',
    recognizedAsLiability: true,
    accountingStandard: 'NIC 37 Párrafo 24'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    document: 'C.C. 1.018.420.551',
    fullName: 'David Ricardo Gómez',
    position: 'Director General de Operaciones',
    baseSalary: 4500000,
    daysWorked: 30,
    dayOvertimeHours: 0,
    nightOvertimeHours: 0,
    sundayHolidayHours: 0,
    appliesTransportAllowance: false, // > 2 SMMLV
    riskLevelArl: 1,
    otherDeductions: 0
  },
  {
    id: 'emp-2',
    document: 'C.C. 1.020.765.890',
    fullName: 'Andrea Paola Salamanca',
    position: 'Coordinadora Contable y Administrativa',
    baseSalary: 2400000,
    daysWorked: 30,
    dayOvertimeHours: 4,
    nightOvertimeHours: 0,
    sundayHolidayHours: 0,
    appliesTransportAllowance: true, // <= 2 SMMLV
    riskLevelArl: 1,
    otherDeductions: 50000
  },
  {
    id: 'emp-3',
    document: 'C.C. 1.032.489.123',
    fullName: 'Sebastián Mora Villamil',
    position: 'Especialista en Soporte y Ventas',
    baseSalary: 1600000,
    daysWorked: 30,
    dayOvertimeHours: 8,
    nightOvertimeHours: 4,
    sundayHolidayHours: 8,
    appliesTransportAllowance: true, // <= 2 SMMLV
    riskLevelArl: 2,
    otherDeductions: 0
  }
];

export const INITIAL_ADJUSTMENTS: AdjustmentItem[] = [
  {
    id: 'adj-1',
    type: 'DEPRECIACION',
    assetName: 'Equipos de Cómputo y Servidores (Depreciación Línea Recta)',
    historicalCost: 22000000,
    salvageValue: 2200000, // 10% residual
    usefulLifeMonths: 60, // 5 años
    monthsToAdjust: 1,
    calculatedAmount: 330000, // (22M - 2.2M) / 60 = 330,000/mes
    description: 'Depreciación contable correspondiente al mes de operaciones bajo NIC 16.',
    applied: true
  },
  {
    id: 'adj-2',
    type: 'DEPRECIACION',
    assetName: 'Muebles y Enseres de Oficina',
    historicalCost: 8000000,
    salvageValue: 800000, // 10% residual
    usefulLifeMonths: 120, // 10 años
    monthsToAdjust: 1,
    calculatedAmount: 60000, // (8M - 0.8M) / 120 = 60,000/mes
    description: 'Depreciación de mobiliario administrativo del mes de operaciones.',
    applied: true
  },
  {
    id: 'adj-3',
    type: 'GASTO_ANTICIPADO',
    assetName: 'Póliza de Seguros Todo Riesgo Pagada por Anticipado',
    historicalCost: 3600000,
    salvageValue: 0,
    usefulLifeMonths: 12,
    monthsToAdjust: 1,
    calculatedAmount: 300000, // 3.6M / 12 = 300,000/mes
    description: 'Amortización del gasto del primer mes devengado de la cobertura de la póliza.',
    applied: true
  }
];
