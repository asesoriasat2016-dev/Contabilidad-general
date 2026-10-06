import React from 'react';
import { 
  Building2, 
  Printer, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { CompanyProfile, OpeningPartnerContribution, InventoryItem, KardexEntry, ClientReceivable, Employee, AdjustmentItem } from '../types/accounting';
import { FinancialStatementsResult, formatCurrency, formatNumber } from '../utils/accountingCalculations';

interface PrintReportViewProps {
  company: CompanyProfile;
  partners: OpeningPartnerContribution[];
  kardex: KardexEntry[];
  receivables: ClientReceivable[];
  employees: Employee[];
  adjustments: AdjustmentItem[];
  statements: FinancialStatementsResult;
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  company,
  partners,
  kardex,
  receivables,
  employees,
  adjustments,
  statements,
  onClose
}) => {
  const { balanceSheet, incomeStatement, cashFlow, notes } = statements;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-4 sm:p-8 flex justify-center">
      <div className="bg-white max-w-4xl w-full p-8 rounded-xl shadow-2xl space-y-8 print:p-0 print:shadow-none print:max-w-none text-slate-900">
        {/* Floating Print Action Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">
              Vista Previa de Informe Académico & Dictamen Contable Oficial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-md hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar como PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Header */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
            <img
              src="/src/assets/images/logo_praxis_contable_1791302757694.jpg"
              alt="Logo Institucional PraxisContable"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center space-y-1 flex-1">
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {company.name}
            </h1>
            <p className="font-mono text-xs text-slate-600">
              NIT: {company.nit} · DOMICILIO: {company.city}
            </p>
            <div className="pt-0.5">
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                Referencia / Consulta Docente: https://share.gemini.google/x5sTxBSgy0hn
              </span>
            </div>
            <h2 className="text-sm font-semibold text-indigo-900 uppercase pt-1">
              INFORME CONTABLE INTEGRAL Y ESTADOS FINANCIEROS BAJO NIIF
            </h2>
            <p className="text-xs text-slate-500">
              Período de Operaciones y Corte al 31 de marzo de 2026
            </p>
          </div>
          <div className="w-16 hidden sm:block shrink-0"></div>
        </div>

        {/* 1. Resumen de Constitución */}
        <div className="space-y-3 text-xs">
          <h3 className="text-sm font-bold border-b border-slate-300 pb-1 uppercase tracking-wide text-indigo-950">
            1. Constitución y Formalización Legal
          </h3>
          <p className="text-slate-700 leading-relaxed">
            La sociedad comercial <strong>{company.name}</strong> fue constituida bajo la forma jurídica de <strong>Sociedad por Acciones Simplificada (S.A.S.)</strong> regida por la Ley 1258 de 2008. Actividad económica CIIU {company.economicActivityCode}: {company.activityDescription}. Capital suscrito y pagado por valor de {formatCurrency(company.capitalPaid)}.
          </p>
        </div>

        {/* 2. Balance de Situación Financiera */}
        <div className="space-y-3 text-xs">
          <h3 className="text-sm font-bold border-b border-slate-300 pb-1 uppercase tracking-wide text-indigo-950">
            2. Estado de Situación Financiera Clasificado
          </h3>
          <div className="grid grid-cols-2 gap-6 pt-1">
            <div className="space-y-2">
              <strong className="block text-slate-900 text-xs border-b border-slate-200 pb-1">ACTIVOS</strong>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between">
                  <span>Efectivo y Equivalentes de Efectivo:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentAssets.cashAndEquivalents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deudores Comerciales Netos (NIIF 9):</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentAssets.tradeReceivablesNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventarios en Bodega:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentAssets.inventories)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos y Diferidos:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentAssets.taxAssets + balanceSheet.currentAssets.prepaidExpenses)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                  <span>Total Activo Corriente:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentAssets.totalCurrentAssets)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Propiedades, Planta y Equipo Netas:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.nonCurrentAssets.totalNonCurrentAssets)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-slate-900 bg-slate-100 p-1 rounded">
                  <span>TOTAL ACTIVOS:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.totalAssets)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <strong className="block text-slate-900 text-xs border-b border-slate-200 pb-1">PASIVO Y PATRIMONIO</strong>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between">
                  <span>Proveedores Comerciales:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentLiabilities.tradePayables)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beneficios y Obligaciones Laborales:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentLiabilities.payrollAndSocialSecurityPayable + balanceSheet.currentLiabilities.provisionsEmployeeBenefits)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos por Pagar (IVA/Renta):</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.currentLiabilities.taxesPayable + incomeStatement.incomeTaxProvision)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provisiones Litigios y Demandas:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.nonCurrentLiabilities.contingentProvisions)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                  <span>Total Pasivos:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.totalLiabilities + incomeStatement.incomeTaxProvision)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Capital Social Pagado:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.equity.subscribedAndPaidCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilidad Neta y Reservas:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.equity.retainedEarnings + balanceSheet.equity.legalReserve)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-slate-900 bg-slate-100 p-1 rounded">
                  <span>TOTAL PASIVO + PATRIMONIO:</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Estado de Resultados */}
        <div className="space-y-3 text-xs">
          <h3 className="text-sm font-bold border-b border-slate-300 pb-1 uppercase tracking-wide text-indigo-950">
            3. Estado de Resultado Integral
          </h3>
          <div className="space-y-1 divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span>Ingresos de Actividades Ordinarias:</span>
              <span className="font-mono font-bold">{formatCurrency(incomeStatement.grossRevenue)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Menos: Costo de Ventas según Kardex:</span>
              <span className="font-mono">({formatCurrency(incomeStatement.costOfGoodsSold)})</span>
            </div>
            <div className="flex justify-between py-1 font-bold bg-slate-50 px-1">
              <span>Utilidad Bruta en Ventas:</span>
              <span className="font-mono">{formatCurrency(incomeStatement.grossProfit)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Menos: Gastos Operacionales (Administración, Nómina, Deterioro, Ajustes):</span>
              <span className="font-mono">({formatCurrency(incomeStatement.totalOperatingExpenses)})</span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Utilidad antes de Impuesto sobre la Renta:</span>
              <span className="font-mono">{formatCurrency(incomeStatement.incomeBeforeTax)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Menos: Provisión Impuesto de Renta (35% Tarifa General):</span>
              <span className="font-mono">({formatCurrency(incomeStatement.incomeTaxProvision)})</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-sm bg-slate-100 px-2 rounded">
              <span>UTILIDAD NETA DEL EJERCICIO:</span>
              <span className="font-mono text-emerald-800">{formatCurrency(incomeStatement.netIncome)}</span>
            </div>
          </div>
        </div>

        {/* 4. Notas Explicativas Seleccionadas */}
        <div className="space-y-3 text-xs">
          <h3 className="text-sm font-bold border-b border-slate-300 pb-1 uppercase tracking-wide text-indigo-950">
            4. Síntesis de Notas Explicativas a los Estados Financieros (NIIF)
          </h3>
          <div className="space-y-2 text-slate-700 leading-relaxed">
            {notes.slice(0, 6).map((n) => (
              <div key={n.number} className="border-l-2 border-indigo-500 pl-3 py-0.5">
                <strong className="text-slate-900 block font-sans">Nota {n.number}. {n.title} ({n.standardReference})</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">{n.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border-t border-slate-400 pt-2">
            <span className="font-bold block text-slate-900">{company.legalRepresentative}</span>
            <span className="text-slate-500 block">Representante Legal</span>
            <span className="text-[10px] text-slate-400 font-mono">{company.idRepresentative}</span>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <span className="font-bold block text-slate-900">Andrea Paola Salamanca</span>
            <span className="text-slate-500 block">Contador Público Titulado</span>
            <span className="text-[10px] text-slate-400 font-mono">T.P. 248.901-T</span>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <span className="font-bold block text-slate-900">{company.fiscalAuditor || 'Revisoría Fiscal'}</span>
            <span className="text-slate-500 block">Revisor Fiscal</span>
            <span className="text-[10px] text-slate-400 font-mono">Dictamen Limpio Sin Salvedades</span>
          </div>
        </div>
      </div>
    </div>
  );
};
