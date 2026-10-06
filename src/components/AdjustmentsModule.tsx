import React from 'react';
import { 
  SlidersHorizontal, 
  Clock, 
  Layers, 
  HelpCircle, 
  CheckCircle, 
  FileCheck2, 
  BookOpenCheck,
  TrendingDown
} from 'lucide-react';
import { AdjustmentItem } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface AdjustmentsModuleProps {
  adjustments: AdjustmentItem[];
  setAdjustments: React.Dispatch<React.SetStateAction<AdjustmentItem[]>>;
  onAdvanceToFinancialStatements: () => void;
}

export const AdjustmentsModule: React.FC<AdjustmentsModuleProps> = ({
  adjustments,
  setAdjustments,
  onAdvanceToFinancialStatements
}) => {
  const toggleAdjustment = (id: string) => {
    setAdjustments(prev => prev.map(adj => 
      adj.id === id ? { ...adj, applied: !adj.applied } : adj
    ));
  };

  const totalAdjustmentsApplied = adjustments
    .filter(a => a.applied)
    .reduce((s, a) => s + a.calculatedAmount, 0);

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              07. Asientos de Ajuste y Regularización de Periodo
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Aplicación rigurosa del <strong>Principio de Devengo / Causación</strong> y <strong>NIC 16 (Propiedades, Planta y Equipo)</strong>. Reconocimiento del desgaste por uso (depreciación lineal) y consumo temporal de gastos pagados por anticipado antes de la emisión de los estados financieros.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdvanceToFinancialStatements}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Ver Estados Financieros y Notas</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Adjustments Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Ajustes Aplicados en el Mes</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalAdjustmentsApplied)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Impacto directo en el Estado de Resultados
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Depreciación Acumulada Activo Fijo</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {formatCurrency(
              adjustments.filter(a => a.applied && a.type === 'DEPRECIACION').reduce((s, a) => s + a.calculatedAmount, 0)
            )}
          </div>
          <span className="text-[11px] text-indigo-800 font-medium mt-1 inline-block">
            Cuentas 1592 (Contra-activo No Corriente)
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Amortización de Seguros Diferidos</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {formatCurrency(
              adjustments.filter(a => a.applied && a.type === 'GASTO_ANTICIPADO').reduce((s, a) => s + a.calculatedAmount, 0)
            )}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium mt-1 inline-block">
            Gasto 513005 vs Activo Diferido 170505
          </span>
        </div>
      </div>

      {/* Adjustment Items List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Matriz de Partidas Sujetas a Regularización y Cierre</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {adjustments.map((adj) => (
            <div
              key={adj.id}
              className={`p-5 rounded-lg border transition-all ${
                adj.applied
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                      {adj.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{adj.assetName}</h3>
                  </div>
                  <p className="text-xs text-slate-600">{adj.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span>Costo Histórico: <strong>{formatCurrency(adj.historicalCost)}</strong></span>
                    <span>·</span>
                    <span>Valor Residual: <strong>{formatCurrency(adj.salvageValue)}</strong></span>
                    <span>·</span>
                    <span>Vida Útil: <strong>{adj.usefulLifeMonths} meses</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Cuota Mensual Ajustada:</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {formatCurrency(adj.calculatedAmount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAdjustment(adj.id)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      adj.applied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {adj.applied ? 'Ajuste Aplicado' : 'Omitir Ajuste'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprobante de Diario de Ajustes */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Comprobante de Diario: Asientos de Ajuste de Fin de Periodo
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Fecha: 31/03/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-sans">
                <th className="py-2 px-3 text-left">Código PUC</th>
                <th className="py-2 px-3 text-left">Cuenta Contable</th>
                <th className="py-2 px-3 text-right">Débito (Gasto)</th>
                <th className="py-2 px-3 text-right">Crédito (Ajuste)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">516015</td>
                <td className="py-2 px-3 font-sans text-slate-800">Gasto Depreciación Equipos de Cómputo (NIC 16)</td>
                <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(330000)}</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">159220</td>
                <td className="py-2 px-3 font-sans text-slate-800">Depreciación Acumulada Equipos de Cómputo</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
                <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(330000)}</td>
              </tr>

              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">516015</td>
                <td className="py-2 px-3 font-sans text-slate-800">Gasto Depreciación Muebles y Enseres</td>
                <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(60000)}</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">159215</td>
                <td className="py-2 px-3 font-sans text-slate-800">Depreciación Acumulada Muebles y Enseres</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
                <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(60000)}</td>
              </tr>

              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">513005</td>
                <td className="py-2 px-3 font-sans text-slate-800">Gasto Operacional Seguros Generales Devengados</td>
                <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(300000)}</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700">170505</td>
                <td className="py-2 px-3 font-sans text-slate-800">Gastos Pagados por Anticipado - Póliza de Seguros</td>
                <td className="py-2 px-3 text-right text-slate-400">$0</td>
                <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(300000)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">SUMAS IGUALES DE AJUSTES</td>
                <td className="py-2.5 px-3 text-right text-slate-900">{formatCurrency(690000)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-700">{formatCurrency(690000)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Docente Masterclass Box */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-5 text-xs text-indigo-950 space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <BookOpenCheck className="w-4 h-4 text-indigo-700" />
          <span>Cátedra del Docente: La Depreciación no es un "Fondo de Ahorro en Efectivo"</span>
        </div>
        <p className="leading-relaxed text-indigo-900/90">
          Un concepto frecuentemente malentendido en las aulas es que la depreciación equivale a "guardar dinero en una alcancía o cuenta bancaria" para comprar otro activo en 5 años.
        </p>
        <p className="leading-relaxed text-indigo-900/90">
          Contablemente, la <strong>depreciación es la distribución sistemática del costo de un activo a lo largo de su vida útil estimada</strong>, reflejando su desgaste y contribución a la generación de ingresos (Principio de Asociación). No involucra salida de efectivo real en el momento del asiento (por eso se suma en el flujo de efectivo indirecto), sino que reduce el valor en libros del activo y la utilidad del ejercicio.
        </p>
      </div>
    </div>
  );
};
