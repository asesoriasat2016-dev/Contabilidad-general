import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  FileCheck2, 
  BookOpenCheck,
  Percent,
  TrendingDown,
  Layers
} from 'lucide-react';
import { ClientReceivable, ContingentProvision } from '../types/accounting';
import { calculateReceivablesAging, formatCurrency, formatNumber } from '../utils/accountingCalculations';

interface ProvisionsModuleProps {
  receivables: ClientReceivable[];
  contingencies: ContingentProvision[];
  setContingencies: React.Dispatch<React.SetStateAction<ContingentProvision[]>>;
  onAdvanceToPayroll: () => void;
}

export const ProvisionsModule: React.FC<ProvisionsModuleProps> = ({
  receivables,
  contingencies,
  setContingencies,
  onAdvanceToPayroll
}) => {
  const [selectedStandard, setSelectedStandard] = useState<'NIIF_9' | 'FISCAL'>('NIIF_9');

  const { summary, niifRates, niifPceTotal, fiscalGeneralTotal } = calculateReceivablesAging(receivables);

  const toggleContingency = (id: string) => {
    setContingencies(prev => prev.map(c => 
      c.id === id ? { ...c, recognizedAsLiability: !c.recognizedAsLiability } : c
    ));
  };

  const totalRecognizedContingencies = contingencies
    .filter(c => c.recognizedAsLiability)
    .reduce((s, c) => s + c.estimatedAmount, 0);

  const chosenImpairment = selectedStandard === 'NIIF_9' ? niifPceTotal : fiscalGeneralTotal;

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              05. Módulo de Provisiones, Deterioro de Cartera y Contingencias
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Cálculo técnico y contraste normativo entre el <strong>Deterioro bajo NIIF 9 (Pérdida Crediticia Esperada - PCE)</strong> y la <strong>Provisión Fiscal (E.T. Art. 145)</strong>, complementado con la evaluación de pasivos contingentes y litigios bajo la <strong>NIC 37</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdvanceToPayroll}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Avanzar al Módulo de Nómina</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              PARADIGMA DE MEDICIÓN DE CARTERA
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Matriz de Deterioro de Clientes (Cuenta 1399)
            </h2>
          </div>

          <div className="inline-flex rounded-md shadow-2xs border border-slate-200 p-0.5 bg-slate-100">
            <button
              onClick={() => setSelectedStandard('NIIF_9')}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                selectedStandard === 'NIIF_9'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NIIF 9: Modelo Pérdida Crediticia Esperada (PCE)
            </button>
            <button
              onClick={() => setSelectedStandard('FISCAL')}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                selectedStandard === 'FISCAL'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fiscal: Provisión General / Individual (E.T. Art. 145)
            </button>
          </div>
        </div>

        {/* Breakdown by Ageing Bucket */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-medium block">Vigente (Sin Vencer)</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(summary.vigente)}
            </span>
            <span className="text-[11px] text-indigo-600 font-mono block mt-1">
              Tasa PCE: {(niifRates.vigente * 100).toFixed(0)}% = {formatCurrency(summary.vigente * niifRates.vigente)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-medium block">Vencida 1 a 30 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(summary.rango1_30)}
            </span>
            <span className="text-[11px] text-indigo-600 font-mono block mt-1">
              Tasa PCE: {(niifRates.rango1_30 * 100).toFixed(0)}% = {formatCurrency(summary.rango1_30 * niifRates.rango1_30)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-medium block">Vencida 31 a 60 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(summary.rango31_60)}
            </span>
            <span className="text-[11px] text-indigo-600 font-mono block mt-1">
              Tasa PCE: {(niifRates.rango31_60 * 100).toFixed(0)}% = {formatCurrency(summary.rango31_60 * niifRates.rango31_60)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-medium block">Vencida 61 a 90 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(summary.rango61_90)}
            </span>
            <span className="text-[11px] text-indigo-600 font-mono block mt-1">
              Tasa PCE: {(niifRates.rango61_90 * 100).toFixed(0)}% = {formatCurrency(summary.rango61_90 * niifRates.rango61_90)}
            </span>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-rose-800 font-medium block">&gt; 90 Días (Crítica)</span>
            <span className="font-mono tabular-nums font-bold text-rose-700 text-sm block mt-1">
              {formatCurrency(summary.rangoMas90)}
            </span>
            <span className="text-[11px] text-rose-700 font-mono block mt-1">
              Tasa PCE: {(niifRates.rangoMas90 * 100).toFixed(0)}% = {formatCurrency(summary.rangoMas90 * niifRates.rangoMas90)}
            </span>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="mt-5 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-indigo-900 text-sm block">
              Deterioro Total a Reconocer en Libros (NIIF 9): {formatCurrency(niifPceTotal)}
            </span>
            <span className="text-indigo-800 mt-0.5 block">
              Enfoque prospectivo: Se provisiona desde el día 1 de emisión según probabilidad estadística de incumplimiento.
            </span>
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-700 block">
              Comparativo Fiscal General: {formatCurrency(fiscalGeneralTotal)}
            </span>
            <span className="text-slate-500 text-[11px]">
              Diferencia Temporaria (Impuesto Diferido Débito): {formatCurrency(Math.abs(niifPceTotal - fiscalGeneralTotal))}
            </span>
          </div>
        </div>
      </div>

      {/* Contingent Provisions Section (NIC 37) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Pasivos Contingentes y Provisiones de Pasivo (NIC 37 / Sección 21)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Obligaciones presentes derivadas de sucesos pasados con incertidumbre sobre su cuantía o vencimiento.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total en Pasivo: {formatCurrency(totalRecognizedContingencies)}
          </span>
        </div>

        <div className="space-y-3">
          {contingencies.map((cont) => (
            <div
              key={cont.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    {cont.type}
                  </span>
                  <span className="font-bold text-slate-900">
                    Probabilidad: {cont.probability} (&gt; 50%)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{cont.accountingStandard}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {cont.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Cuantía Estimada:</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {formatCurrency(cont.estimatedAmount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleContingency(cont.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    cont.recognizedAsLiability
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {cont.recognizedAsLiability ? 'Reconocido en Pasivo' : 'Solo en Notas'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asiento Contable Generado */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileCheck2 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Comprobante de Diario: Reconocimiento de Deterioro y Provisiones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-sans">
                <th className="py-2 px-3 text-left">Código PUC</th>
                <th className="py-2 px-3 text-left">Cuenta Contable</th>
                <th className="py-2 px-3 text-right">Débito (Gasto)</th>
                <th className="py-2 px-3 text-right">Crédito (Contra-activo / Pasivo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">519910</td>
                <td className="py-2 px-3 font-sans text-slate-800">Gasto Operacional por Deterioro de Cartera (NIIF 9)</td>
                <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(niifPceTotal)}</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">139905</td>
                <td className="py-2 px-3 font-sans text-slate-800">Deterioro Acumulado de Clientes (Cuenta Valuación)</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
                <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(niifPceTotal)}</td>
              </tr>
              {totalRecognizedContingencies > 0 && (
                <>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">531520</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Gasto Extraordinario Provisiones Litigios y Garantías</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalRecognizedContingencies)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">263505</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Provisiones para Litigios y Demandas (Pasivo No Corriente)</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                    <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(totalRecognizedContingencies)}</td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">SUMAS IGUALES DEL AJUSTE</td>
                <td className="py-2.5 px-3 text-right text-slate-900">{formatCurrency(niifPceTotal + totalRecognizedContingencies)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-700">{formatCurrency(niifPceTotal + totalRecognizedContingencies)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Docente Masterclass */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-5 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <BookOpenCheck className="w-4 h-4 text-amber-700" />
          <span>Cátedra del Docente: Del Modelo de "Pérdida Incurrida" (Fiscal) a "Pérdida Esperada" (NIIF 9)</span>
        </div>
        <p className="leading-relaxed text-amber-900/90">
          En la contabilidad tradicional y fiscal colombiana, se esperaba a que una factura tuviera mora demostrada (3 meses para el 5%, o más de un año para el 33% individual) para poder deducirla. La crisis financiera global de 2008 demostró que este modelo llegaba "demasiado tarde".
        </p>
        <p className="leading-relaxed text-amber-900/90">
          Bajo la <strong>NIIF 9</strong>, una entidad debe reconocer una pérdida esperada desde el <strong>primer día en que otorga el crédito</strong> (Pérdida Crediticia Esperada a 12 meses), incrementándola a toda la vida del instrumento financiero si el riesgo de crédito aumenta significativamente.
        </p>
      </div>
    </div>
  );
};
