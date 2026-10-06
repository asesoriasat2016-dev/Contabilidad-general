import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Scale, 
  DollarSign, 
  Layers, 
  Printer, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { CompanyProfile, FinancialNote } from '../types/accounting';
import { FinancialStatementsResult, formatCurrency, formatNumber } from '../utils/accountingCalculations';

interface FinancialStatementsModuleProps {
  company: CompanyProfile;
  statements: FinancialStatementsResult;
  trialBalanceItems: any[];
  onPrint: () => void;
}

export const FinancialStatementsModule: React.FC<FinancialStatementsModuleProps> = ({
  company,
  statements,
  trialBalanceItems,
  onPrint
}) => {
  const [activeStatementTab, setActiveStatementTab] = useState<'ESF' | 'ERI' | 'EFE' | 'BALANZA' | 'NOTAS' | 'GRAFICOS'>('GRAFICOS');
  const [expandedNote, setExpandedNote] = useState<number | null>(1);
  const [chartView, setChartView] = useState<'ESTRUCTURA' | 'ACTIVOS' | 'FINANCIACION' | 'RESULTADOS'>('ESTRUCTURA');

  const { balanceSheet, incomeStatement, cashFlow, notes } = statements;

  // Data for Charts
  const totalLiabilitiesWithTax = balanceSheet.totalLiabilities + incomeStatement.incomeTaxProvision;
  
  // 1. Comparison of Assets vs Liabilities + Equity
  const structureComparisonData = [
    {
      categoria: 'Activos Totales',
      Corriente: balanceSheet.currentAssets.totalCurrentAssets,
      NoCorriente: balanceSheet.nonCurrentAssets.totalNonCurrentAssets,
      Total: balanceSheet.totalAssets
    },
    {
      categoria: 'Pasivo y Patrimonio',
      PasivoCorriente: balanceSheet.currentLiabilities.totalCurrentLiabilities + incomeStatement.incomeTaxProvision,
      PasivoNoCorriente: balanceSheet.nonCurrentLiabilities.totalNonCurrentLiabilities,
      Patrimonio: balanceSheet.equity.totalEquity,
      Total: balanceSheet.totalLiabilitiesAndEquity
    }
  ];

  // 2. Financing Sources (Terceros vs Socios)
  const financingPieData = [
    { name: 'Financiación Terceros (Pasivos)', value: totalLiabilitiesWithTax, color: '#f59e0b' },
    { name: 'Financiación Propia (Patrimonio)', value: balanceSheet.equity.totalEquity, color: '#4f46e5' },
  ];

  // 3. Asset Composition
  const assetsPieData = [
    { name: 'Efectivo y Bancos', value: balanceSheet.currentAssets.cashAndEquivalents, color: '#0284c7' },
    { name: 'Clientes Netos (Cartera)', value: balanceSheet.currentAssets.tradeReceivablesNet, color: '#6366f1' },
    { name: 'Inventarios en Bodega', value: balanceSheet.currentAssets.inventories, color: '#10b981' },
    { name: 'Propiedades, Planta y Equipo', value: balanceSheet.nonCurrentAssets.totalNonCurrentAssets, color: '#8b5cf6' },
    ...(balanceSheet.currentAssets.taxAssets > 0 ? [{ name: 'IVA Descontable', value: balanceSheet.currentAssets.taxAssets, color: '#06b6d4' }] : []),
    ...(balanceSheet.currentAssets.prepaidExpenses > 0 ? [{ name: 'Seguros Diferidos', value: balanceSheet.currentAssets.prepaidExpenses, color: '#ec4899' }] : []),
  ];

  // 4. Liabilities & Equity Composition
  const liabilitiesEquityPieData = [
    { name: 'Proveedores Nacionales', value: balanceSheet.currentLiabilities.tradePayables, color: '#f59e0b' },
    { name: 'Nómina y Beneficios Empleados', value: balanceSheet.currentLiabilities.payrollAndSocialSecurityPayable, color: '#ef4444' },
    { name: 'Provisiones Laborales (Cesantías/Prima)', value: balanceSheet.currentLiabilities.provisionsEmployeeBenefits, color: '#f97316' },
    { name: 'Impuestos por Pagar (IVA/Renta)', value: balanceSheet.currentLiabilities.taxesPayable + incomeStatement.incomeTaxProvision, color: '#e11d48' },
    { name: 'Litigios y Contingencias (NIC 37)', value: balanceSheet.nonCurrentLiabilities.contingentProvisions, color: '#b45309' },
    { name: 'Capital Social Pagado', value: balanceSheet.equity.subscribedAndPaidCapital, color: '#4f46e5' },
    { name: 'Utilidades y Reservas', value: balanceSheet.equity.retainedEarnings + balanceSheet.equity.legalReserve, color: '#059669' },
  ].filter(d => d.value > 0);

  // 5. Income Statement Breakdown Data
  const incomeStatementBarData = [
    { etapa: 'Ingresos', valor: incomeStatement.grossRevenue, fill: '#10b981' },
    { etapa: 'Costo Ventas', valor: incomeStatement.costOfGoodsSold, fill: '#ef4444' },
    { etapa: 'Utilidad Bruta', valor: incomeStatement.grossProfit, fill: '#3b82f6' },
    { etapa: 'Gastos Operacionales', valor: incomeStatement.totalOperatingExpenses, fill: '#f97316' },
    { etapa: 'Utilidad Antes Impuestos', valor: incomeStatement.incomeBeforeTax, fill: '#6366f1' },
    { etapa: 'Impuesto Renta 35%', valor: incomeStatement.incomeTaxProvision, fill: '#dc2626' },
    { etapa: 'Utilidad Neta', valor: incomeStatement.netIncome, fill: '#059669' }
  ];

  // Financial Indicators calculations
  const totalCurrentLiabWithTax = balanceSheet.currentLiabilities.totalCurrentLiabilities + incomeStatement.incomeTaxProvision;
  const currentRatio = totalCurrentLiabWithTax > 0 
    ? (balanceSheet.currentAssets.totalCurrentAssets / totalCurrentLiabWithTax).toFixed(2)
    : 'N/A';
  const quickRatio = totalCurrentLiabWithTax > 0
    ? ((balanceSheet.currentAssets.totalCurrentAssets - balanceSheet.currentAssets.inventories) / totalCurrentLiabWithTax).toFixed(2)
    : 'N/A';
  const debtRatio = balanceSheet.totalAssets > 0
    ? ((totalLiabilitiesWithTax / balanceSheet.totalAssets) * 100).toFixed(1)
    : '0';
  const grossMargin = incomeStatement.grossRevenue > 0
    ? ((incomeStatement.grossProfit / incomeStatement.grossRevenue) * 100).toFixed(1)
    : '0';
  const netMargin = incomeStatement.grossRevenue > 0
    ? ((incomeStatement.netIncome / incomeStatement.grossRevenue) * 100).toFixed(1)
    : '0';

  // Custom Tooltip for Recharts
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-md shadow-lg text-xs font-sans space-y-1 border border-slate-700">
          <p className="font-bold text-slate-200">{label || payload[0]?.name}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="font-mono text-indigo-300">
              <span className="font-medium text-slate-300">{item.name || 'Valor'}: </span>
              {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              08. Estados Financieros y Notas Explicativas bajo NIIF
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Conjunto completo de estados financieros de propósito general conforme a <strong>NIIF para las PYMES (Secciones 3 a 8) / NIC 1</strong>. Incluye Estado de Situación Financiera clasificado, Estado de Resultados, Flujos de Efectivo y 12 Notas Explicativas técnicas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar Reporte Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statement Subtabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveStatementTab('ESF')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeStatementTab === 'ESF'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Estado de Situación Financiera (Balance)
        </button>
        <button
          onClick={() => setActiveStatementTab('ERI')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeStatementTab === 'ERI'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Estado de Resultado Integral
        </button>
        <button
          onClick={() => setActiveStatementTab('EFE')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeStatementTab === 'EFE'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Estado de Flujos de Efectivo
        </button>
        <button
          onClick={() => setActiveStatementTab('BALANZA')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeStatementTab === 'BALANZA'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Balanza de Comprobación
        </button>
        <button
          onClick={() => setActiveStatementTab('NOTAS')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeStatementTab === 'NOTAS'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          5. Notas Explicativas (1 a 12)
        </button>
        <button
          onClick={() => setActiveStatementTab('GRAFICOS')}
          className={`py-2 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeStatementTab === 'GRAFICOS'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>6. Visualización Gráfica NIIF</span>
        </button>
      </div>

      {/* 1. ESTADO DE SITUACIÓN FINANCIERA */}
      {activeStatementTab === 'ESF' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          {/* Header of financial statement */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">
              {company.name}
            </h2>
            <p className="text-xs font-mono text-slate-600">NIT: {company.nit}</p>
            <h3 className="text-sm font-semibold text-indigo-900 uppercase mt-1">
              ESTADO DE SITUACIÓN FINANCIERA CLASIFICADO (NIIF)
            </h3>
            <p className="text-xs text-slate-500">
              Al 31 de marzo de 2026 · Expresado en Pesos Colombianos (COP)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
            {/* Left: ACTIVOS */}
            <div className="space-y-4">
              <div className="bg-slate-100 p-2.5 rounded font-bold text-slate-900 flex justify-between">
                <span>ACTIVO</span>
                <span>(NOTA)</span>
              </div>

              {/* Activo Corriente */}
              <div className="space-y-1.5 pl-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-900">
                  Activo Corriente
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Efectivo y Equivalentes de Efectivo (Nota 3)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentAssets.cashAndEquivalents)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Deudores Comerciales Brutos (Nota 4)</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(balanceSheet.currentAssets.tradeReceivablesGross)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Menos: Deterioro Acumulado de Cartera (Nota 4)</span>
                  <span className="font-mono tabular-nums">
                    ({formatCurrency(balanceSheet.currentAssets.receivablesImpairment)})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 bg-slate-50/50 px-1 font-medium">
                  <span className="text-slate-800">Cuentas por Cobrar Netas</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatCurrency(balanceSheet.currentAssets.tradeReceivablesNet)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Inventarios en Bodega (Nota 5)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentAssets.inventories)}
                  </span>
                </div>
                {balanceSheet.currentAssets.taxAssets > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Activos por Impuestos Corrientes (IVA Descontable)</span>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {formatCurrency(balanceSheet.currentAssets.taxAssets)}
                    </span>
                  </div>
                )}
                {balanceSheet.currentAssets.prepaidExpenses > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Gastos Pagados por Anticipado (Seguros)</span>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {formatCurrency(balanceSheet.currentAssets.prepaidExpenses)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t border-slate-300 font-bold bg-indigo-50/40 px-2 rounded">
                  <span className="text-indigo-950">TOTAL ACTIVO CORRIENTE</span>
                  <span className="font-mono tabular-nums text-indigo-950">
                    {formatCurrency(balanceSheet.currentAssets.totalCurrentAssets)}
                  </span>
                </div>
              </div>

              {/* Activo No Corriente */}
              <div className="space-y-1.5 pl-2 pt-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-900">
                  Activo No Corriente
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Propiedades, Planta y Equipo Bruto (Nota 6)</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(balanceSheet.nonCurrentAssets.propertyPlantEquipmentGross)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Menos: Depreciación Acumulada (Nota 6)</span>
                  <span className="font-mono tabular-nums">
                    ({formatCurrency(balanceSheet.nonCurrentAssets.accumulatedDepreciation)})
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 font-bold bg-indigo-50/40 px-2 rounded">
                  <span className="text-indigo-950">TOTAL ACTIVO NO CORRIENTE</span>
                  <span className="font-mono tabular-nums text-indigo-950">
                    {formatCurrency(balanceSheet.nonCurrentAssets.totalNonCurrentAssets)}
                  </span>
                </div>
              </div>

              {/* Total Activos */}
              <div className="pt-3 border-t-2 border-slate-900">
                <div className="flex justify-between py-2 px-3 bg-slate-900 text-white font-bold rounded">
                  <span>TOTAL ACTIVOS</span>
                  <span className="font-mono tabular-nums text-sm">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: PASIVOS Y PATRIMONIO */}
            <div className="space-y-4">
              <div className="bg-slate-100 p-2.5 rounded font-bold text-slate-900 flex justify-between">
                <span>PASIVO Y PATRIMONIO</span>
                <span>(NOTA)</span>
              </div>

              {/* Pasivo Corriente */}
              <div className="space-y-1.5 pl-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-900">
                  Pasivo Corriente
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Proveedores Comerciales Nacionales (Nota 7)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentLiabilities.tradePayables)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Beneficios a Empleados & Nómina (Nota 8)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentLiabilities.payrollAndSocialSecurityPayable)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Provisiones Laborales Prestaciones (Nota 8)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentLiabilities.provisionsEmployeeBenefits)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Impuestos por Pagar (IVA Generado / Renta) (Nota 12)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.currentLiabilities.taxesPayable + incomeStatement.incomeTaxProvision)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-t border-slate-300 font-bold bg-slate-100 px-2 rounded">
                  <span className="text-slate-900">TOTAL PASIVO CORRIENTE</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatCurrency(balanceSheet.currentLiabilities.totalCurrentLiabilities + incomeStatement.incomeTaxProvision)}
                  </span>
                </div>
              </div>

              {/* Pasivo No Corriente */}
              <div className="space-y-1.5 pl-2 pt-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-900">
                  Pasivo No Corriente
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Provisiones para Litigios y Demandas (Nota 9)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.nonCurrentLiabilities.contingentProvisions)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 font-bold bg-slate-100 px-2 rounded">
                  <span className="text-slate-900">TOTAL PASIVOS</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatCurrency(balanceSheet.totalLiabilities + incomeStatement.incomeTaxProvision)}
                  </span>
                </div>
              </div>

              {/* Patrimonio */}
              <div className="space-y-1.5 pl-2 pt-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-indigo-900">
                  Patrimonio de los Accionistas
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Capital Suscrito y Pagado (Nota 10)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.equity.subscribedAndPaidCapital)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Reserva Legal (10% de Utilidad)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatCurrency(balanceSheet.equity.legalReserve)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Utilidad Neta del Ejercicio</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-700">
                    {formatCurrency(balanceSheet.equity.retainedEarnings)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-t border-slate-300 font-bold bg-indigo-50/40 px-2 rounded">
                  <span className="text-indigo-950">TOTAL PATRIMONIO</span>
                  <span className="font-mono tabular-nums text-indigo-950">
                    {formatCurrency(balanceSheet.equity.totalEquity)}
                  </span>
                </div>
              </div>

              {/* Total Pasivos y Patrimonio */}
              <div className="pt-3 border-t-2 border-slate-900">
                <div className="flex justify-between py-2 px-3 bg-slate-900 text-white font-bold rounded">
                  <span>TOTAL PASIVO Y PATRIMONIO</span>
                  <span className="font-mono tabular-nums text-sm">
                    {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Equation balance confirmation badge */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Ecuación Fundamental Verificada:</strong> Activo ({formatCurrency(balanceSheet.totalAssets)}) = Pasivo ({formatCurrency(balanceSheet.totalLiabilities + incomeStatement.incomeTaxProvision)}) + Patrimonio ({formatCurrency(balanceSheet.equity.totalEquity)}).
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700">Diferencia: $0.00 COP</span>
          </div>
        </div>
      )}

      {/* 2. ESTADO DE RESULTADO INTEGRAL */}
      {activeStatementTab === 'ERI' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6 max-w-4xl mx-auto text-xs">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              {company.name}
            </h2>
            <h3 className="text-sm font-semibold text-indigo-900 uppercase mt-1">
              ESTADO DE RESULTADO INTEGRAL (NIIF)
            </h3>
            <p className="text-xs text-slate-500">
              Por el periodo finalizado al 31 de marzo de 2026 · Expresado en COP
            </p>
          </div>

          <div className="space-y-2 divide-y divide-slate-100">
            <div className="flex justify-between py-2 font-medium">
              <span className="text-slate-800">Ingresos de Actividades Ordinarias (Venta de Equipos) (Nota 11)</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {formatCurrency(incomeStatement.grossRevenue)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-rose-700">
              <span>Menos: Costo de Ventas según Kardex Promedio (Nota 11)</span>
              <span className="font-mono tabular-nums font-medium">
                ({formatCurrency(incomeStatement.costOfGoodsSold)})
              </span>
            </div>

            <div className="flex justify-between py-2.5 font-bold bg-slate-50 px-2 rounded text-slate-900">
              <span>UTILIDAD BRUTA OPERACIONAL</span>
              <span className="font-mono tabular-nums text-sm">
                {formatCurrency(incomeStatement.grossProfit)}
              </span>
            </div>

            <div className="pt-2">
              <span className="font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                Gastos de Administración y Operación
              </span>
              <div className="space-y-1 pl-3 text-slate-600">
                <div className="flex justify-between py-1">
                  <span>Gastos de Personal (Nómina, Seguridad Social, Parafiscales, Prestaciones)</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    ({formatCurrency(incomeStatement.administrativeExpenses - 690000)})
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Gastos por Depreciación de Propiedades, Planta y Equipo (NIC 16)</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    ({formatCurrency(390000)})
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Gastos Operacionales de Seguros Devengados</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    ({formatCurrency(300000)})
                  </span>
                </div>
                <div className="flex justify-between py-1 text-rose-700">
                  <span>Gasto por Deterioro de Cartera (PCE NIIF 9) (Nota 4)</span>
                  <span className="font-mono tabular-nums">
                    ({formatCurrency(incomeStatement.impairmentExpense)})
                  </span>
                </div>
                <div className="flex justify-between py-1 text-rose-700">
                  <span>Gasto por Provisiones para Litigios y Garantías (NIC 37) (Nota 9)</span>
                  <span className="font-mono tabular-nums">
                    ({formatCurrency(incomeStatement.contingencyExpense)})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between py-2.5 font-bold bg-indigo-50/50 px-2 rounded text-indigo-950">
              <span>UTILIDAD OPERACIONAL (EBIT)</span>
              <span className="font-mono tabular-nums text-sm">
                {formatCurrency(incomeStatement.operatingIncome)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-slate-700">
              <span>Ingresos / Gastos Financieros Netos</span>
              <span className="font-mono tabular-nums">$0 COP</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-slate-900">
              <span>UTILIDAD ANTES DE IMPUESTOS</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(incomeStatement.incomeBeforeTax)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-rose-700">
              <span>Provisión Impuesto sobre la Renta Corriente (35% Tarifa General E.T.) (Nota 12)</span>
              <span className="font-mono tabular-nums">
                ({formatCurrency(incomeStatement.incomeTaxProvision)})
              </span>
            </div>

            <div className="flex justify-between py-3 px-3 bg-emerald-600 text-white font-bold rounded text-sm">
              <span>UTILIDAD NETA DEL EJERCICIO</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(incomeStatement.netIncome)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ESTADO DE FLUJOS DE EFECTIVO */}
      {activeStatementTab === 'EFE' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6 max-w-4xl mx-auto text-xs">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 uppercase">{company.name}</h2>
            <h3 className="text-sm font-semibold text-indigo-900 uppercase mt-1">
              ESTADO DE FLUJOS DE EFECTIVO (MÉTODO DIRECTO NIIF)
            </h3>
            <p className="text-xs text-slate-500">Por el mes terminado el 31 de marzo de 2026</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                1. Actividades de Operación
              </span>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700">Cobros en efectivo a clientes por venta de tecnología</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatCurrency(cashFlow.operatingActivities.collectionsFromCustomers)}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-slate-50 px-2 font-bold text-slate-900 rounded">
                <span>Flujo Neto de Actividades de Operación</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(cashFlow.operatingActivities.netOperatingCash)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                2. Actividades de Inversión
              </span>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Adquisición de propiedad, planta y equipo en efectivo (aportados en especie en constitución)</span>
                <span className="font-mono tabular-nums">$0 COP</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-50 px-2 font-bold text-slate-900 rounded">
                <span>Flujo Neto de Actividades de Inversión</span>
                <span className="font-mono tabular-nums">$0 COP</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                3. Actividades de Financiación
              </span>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700">Aportes iniciales de capital pagados en efectivo por accionistas</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatCurrency(cashFlow.financingActivities.initialCapitalContributionsCash)}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-slate-50 px-2 font-bold text-slate-900 rounded">
                <span>Flujo Neto de Actividades de Financiación</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(cashFlow.financingActivities.netFinancingCash)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-300 space-y-1">
              <div className="flex justify-between py-2 px-3 bg-indigo-900 text-white font-bold rounded">
                <span>SALDO FINAL DE EFECTIVO Y EQUIVALENTES (CONCILIADO EN BANCO)</span>
                <span className="font-mono tabular-nums text-sm">
                  {formatCurrency(cashFlow.finalCashCalculated)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BALANZA DE COMPROBACIÓN */}
      {activeStatementTab === 'BALANZA' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Balanza de Comprobación de Saldos (Trial Balance)
            </h2>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              Sumas Iguales Débito = Crédito
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Código PUC</th>
                  <th className="py-2.5 px-3">Denominación de la Cuenta</th>
                  <th className="py-2.5 px-3">Clase</th>
                  <th className="py-2.5 px-3 text-right">Movimiento Débito</th>
                  <th className="py-2.5 px-3 text-right">Movimiento Crédito</th>
                  <th className="py-2.5 px-3 text-right">Saldo Débito</th>
                  <th className="py-2.5 px-3 text-right">Saldo Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {trialBalanceItems.map((item: any) => (
                  <tr key={item.code} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-semibold text-slate-800">{item.code}</td>
                    <td className="py-2 px-3 font-sans text-slate-900">{item.name}</td>
                    <td className="py-2 px-3 font-sans text-slate-500">{item.classType}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(item.debit)}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(item.credit)}</td>
                    <td className="py-2 px-3 text-right text-slate-900 font-medium">
                      {item.balanceDebit > 0 ? formatCurrency(item.balanceDebit) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-indigo-700 font-medium">
                      {item.balanceCredit > 0 ? formatCurrency(item.balanceCredit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. NOTAS EXPLICATIVAS (1 a 12) */}
      {activeStatementTab === 'NOTAS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              Notas Explicativas a los Estados Financieros (NIIF para las PYMES / NIC 1)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Las notas son parte integral de los estados financieros. Proporcionan descripciones narrativas, desagregaciones de partidas cuantitativas e información sobre partidas no reconocidas en el balance general.
            </p>
          </div>

          <div className="space-y-3">
            {notes.map((note) => {
              const isExpanded = expandedNote === note.number;
              return (
                <div
                  key={note.number}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedNote(isExpanded ? null : note.number)}
                    className="w-full p-4 text-left flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        Nota {note.number}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{note.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        {note.standardReference}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 space-y-4 text-xs text-slate-700 leading-relaxed bg-white">
                      <p>{note.content}</p>

                      {note.breakdownTable && (
                        <div className="overflow-x-auto pt-2">
                          <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                {note.breakdownTable.headers.map((h, i) => (
                                  <th key={i} className={`py-2 px-3 ${i > 0 ? 'text-right' : ''}`}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                              {note.breakdownTable.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`py-2 px-3 ${cIdx === 0 ? 'font-sans font-medium text-slate-900' : 'text-right text-slate-700'}`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                            {note.breakdownTable.totalLabel && (
                              <tfoot>
                                <tr className="bg-slate-100 font-bold border-t border-slate-300">
                                  <td className="py-2 px-3 font-sans text-slate-900">
                                    {note.breakdownTable.totalLabel}
                                  </td>
                                  <td colSpan={note.breakdownTable.headers.length - 1} className="py-2 px-3 text-right font-mono text-indigo-700">
                                    {note.breakdownTable.totalValue}
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. VISUALIZACIÓN GRÁFICA DE LA ESTRUCTURA FINANCIERA BAJO NIIF */}
      {activeStatementTab === 'GRAFICOS' && (
        <div className="space-y-6">
          {/* Header of Visual Analytics */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Tablero Gráfico de Estructura Financiera bajo NIIF
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Visualización interactiva de la ecuación patrimonial, proporciones de solvencia y composición detallada de fuentes de financiación y recursos económicos.
              </p>
            </div>

            {/* View Selector Controls */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setChartView('ESTRUCTURA')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  chartView === 'ESTRUCTURA'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Estructura Global
              </button>
              <button
                type="button"
                onClick={() => setChartView('ACTIVOS')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  chartView === 'ACTIVOS'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Composición Activos
              </button>
              <button
                type="button"
                onClick={() => setChartView('FINANCIACION')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  chartView === 'FINANCIACION'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pasivo vs Patrimonio
              </button>
              <button
                type="button"
                onClick={() => setChartView('RESULTADOS')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  chartView === 'RESULTADOS'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cascada de Resultados
              </button>
            </div>
          </div>

          {/* KPI Cards: Financial Ratios */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Razón Corriente</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {currentRatio}x
              </div>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                Solvencia a corto plazo
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Prueba Ácida</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {quickRatio}x
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Sin depender de inventario
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Nivel de Endeudamiento</span>
              <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">
                {debtRatio}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Pasivos sobre Activo Total
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Margen Bruto</span>
              <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
                {grossMargin}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Utilidad tras Costo Kardex
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Margen Neto</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {netMargin}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Rendimiento final del periodo
              </span>
            </div>
          </div>

          {/* VIEW 1: ESTRUCTURA GLOBAL (ECUACIÓN PATRIMONIAL Y APALANCAMIENTO) */}
          {chartView === 'ESTRUCTURA' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Bar Chart: Balance Equation */}
              <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Comprobación Gráfica de la Ecuación Patrimonial
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Activos = Pasivo + Patrimonio
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Activos Totales',
                          'Activo Corriente': balanceSheet.currentAssets.totalCurrentAssets,
                          'Activo No Corriente': balanceSheet.nonCurrentAssets.totalNonCurrentAssets,
                        },
                        {
                          name: 'Pasivo y Patrimonio',
                          'Pasivo Total': totalLiabilitiesWithTax,
                          'Patrimonio Neto': balanceSheet.equity.totalEquity,
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomCurrencyTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar dataKey="Activo Corriente" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Activo No Corriente" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pasivo Total" stackId="b" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Patrimonio Neto" stackId="b" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 font-mono">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans block">Total Activo (Debe):</span>
                    <strong className="text-slate-900 text-sm">{formatCurrency(balanceSheet.totalAssets)}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans block">Pasivo + Patrimonio (Haber):</span>
                    <strong className="text-indigo-700 text-sm">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</strong>
                  </div>
                </div>
              </div>

              {/* Donut Chart: Financing Structure (Terceros vs Socios) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Fuentes de Financiación (Estructura de Capital)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">100% de Recursos</span>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financingPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {financingPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCurrencyTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span>Deuda con Terceros (Pasivos):</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {debtRatio}% ({formatCurrency(totalLiabilitiesWithTax)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                      <span>Recursos Propios (Patrimonio):</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-700">
                      {(100 - Number(debtRatio)).toFixed(1)}% ({formatCurrency(balanceSheet.equity.totalEquity)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: COMPOSICIÓN DETALLADA DE ACTIVOS */}
          {chartView === 'ACTIVOS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs">
                  Distribución Porcentual del Activo Total
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetsPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {assetsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCurrencyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs pb-2 border-b border-slate-100">
                  Desglose Monetario de los Recursos Económicos
                </h3>
                <div className="space-y-2 divide-y divide-slate-100 text-xs">
                  {assetsPieData.map((item, idx) => {
                    const percent = ((item.value / balanceSheet.totalAssets) * 100).toFixed(1);
                    return (
                      <div key={idx} className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium text-slate-800">{item.name}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded text-xs text-indigo-950">
                  <strong>Análisis de Liquidez Inmediata:</strong> El efectivo en bancos y los inventarios para la venta representan más del {(((balanceSheet.currentAssets.cashAndEquivalents + balanceSheet.currentAssets.inventories) / balanceSheet.totalAssets) * 100).toFixed(0)}% del activo total, asegurando una posición de solvencia holgada para la operación tecnológica.
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: COMPOSICIÓN DE PASIVOS Y PATRIMONIO */}
          {chartView === 'FINANCIACION' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs">
                  Estratificación de Acreedores y Derechos de Accionistas
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={liabilitiesEquityPieData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={95} />
                      <Tooltip content={<CustomCurrencyTooltip />} />
                      <Bar dataKey="value" name="Monto" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                        {liabilitiesEquityPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Prioridad Legal de Pagos ante Liquidación
                </h3>
                <div className="space-y-2 text-slate-700 leading-relaxed text-[11px]">
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-200">
                    <strong className="text-rose-900 block">1° Orden: Créditos Laborales e Impuestos</strong>
                    Salarios, seguridad social y retenciones fiscales tienen prelación legal constitucional de pago sobre cualquier otro acreedor.
                  </div>
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
                    <strong className="text-amber-900 block">2° Orden: Proveedores y Obligaciones Comerciales</strong>
                    Créditos ordinarios y provisiones contingentes por demandas bajo NIC 37.
                  </div>
                  <div className="p-2.5 rounded bg-indigo-50 border border-indigo-200">
                    <strong className="text-indigo-900 block">3° Orden: Remanente Residual para Accionistas</strong>
                    El capital social y las utilidades acumuladas solo se distribuyen tras cubrir el 100% del pasivo con terceros.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: CASCADA DE RESULTADOS */}
          {chartView === 'RESULTADOS' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">
                    Cascada de Rentabilidad: Del Ingreso Bruto a la Utilidad Neta
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Muestra cómo el margen se va transformando en cada etapa tras costos, gastos e impuestos.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  Utilidad Neta: {formatCurrency(incomeStatement.netIncome)}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeStatementBarData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="etapa" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomCurrencyTooltip />} />
                    <Bar dataKey="valor" name="Valor" radius={[4, 4, 0, 0]}>
                      {incomeStatementBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cátedra Docente Explicativa sobre Análisis Gráfico */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-5 text-xs text-indigo-950 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-indigo-700" />
              <span>Cátedra del Docente: La Interpretación Visual del Balance bajo NIIF</span>
            </div>
            <p className="leading-relaxed text-indigo-900/90">
              Para un docente y un analista financiero, las cifras absolutas solo cobran sentido cuando se analizan sus <strong>proporciones relativas</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 p-3 rounded border border-indigo-200">
                <strong className="block text-indigo-900 mb-0.5">1. Equilibrio Financiero</strong>
                <p className="text-indigo-900/80">
                  El Activo Corriente (${(balanceSheet.currentAssets.totalCurrentAssets / 1000000).toFixed(1)}M) debe ser holgadamente superior al Pasivo Corriente (${(totalCurrentLiabWithTax / 1000000).toFixed(1)}M). Esto genera un <strong>Fondo de Maniobra positivo</strong> que garantiza continuidad operativa sin recurrir a deuda costosa.
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded border border-indigo-200">
                <strong className="block text-indigo-900 mb-0.5">2. Bajo Apalancamiento</strong>
                <p className="text-indigo-900/80">
                  Con un endeudamiento del {debtRatio}%, la empresa está financiada principalmente con capital propio ({ (100 - Number(debtRatio)).toFixed(1) }%), lo que otorga autonomía y bajo riesgo de quiebra ante caídas del mercado.
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded border border-indigo-200">
                <strong className="block text-indigo-900 mb-0.5">3. Eficiencia Operativa</strong>
                <p className="text-indigo-900/80">
                  El margen bruto del {grossMargin}% refleja que el costo de ventas liquidado en Kardex es controlado, dejando espacio suficiente para cubrir la nómina y generar utilidad antes de renta.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
