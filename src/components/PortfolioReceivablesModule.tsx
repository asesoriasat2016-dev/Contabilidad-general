import React, { useState } from 'react';
import { 
  CreditCard, 
  Clock, 
  DollarSign, 
  Calendar, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ClientReceivable } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface PortfolioReceivablesModuleProps {
  receivables: ClientReceivable[];
  setReceivables: React.Dispatch<React.SetStateAction<ClientReceivable[]>>;
  onAdvanceToProvisions: () => void;
}

export const PortfolioReceivablesModule: React.FC<PortfolioReceivablesModuleProps> = ({
  receivables,
  setReceivables,
  onAdvanceToProvisions
}) => {
  const [selectedReceivable, setSelectedReceivable] = useState<ClientReceivable | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(1000000);

  const totalPortfolioGross = receivables.reduce((s, r) => s + r.totalInvoice, 0);
  const totalCollected = receivables.reduce((s, r) => s + r.collectedAmount, 0);
  const totalBalanceDue = receivables.reduce((s, r) => s + r.balance, 0);

  // Aging totals
  const agingVigente = receivables.filter(r => r.daysOverdue <= 0).reduce((s, r) => s + r.balance, 0);
  const aging1_30 = receivables.filter(r => r.daysOverdue > 0 && r.daysOverdue <= 30).reduce((s, r) => s + r.balance, 0);
  const aging31_60 = receivables.filter(r => r.daysOverdue > 30 && r.daysOverdue <= 60).reduce((s, r) => s + r.balance, 0);
  const aging61_90 = receivables.filter(r => r.daysOverdue > 60 && r.daysOverdue <= 90).reduce((s, r) => s + r.balance, 0);
  const agingMas90 = receivables.filter(r => r.daysOverdue > 90).reduce((s, r) => s + r.balance, 0);

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || collectAmount <= 0) return;

    if (collectAmount > selectedReceivable.balance) {
      alert(`El valor del recaudo no puede exceder el saldo pendiente (${formatCurrency(selectedReceivable.balance)}).`);
      return;
    }

    setReceivables(prev => prev.map(r => {
      if (r.id !== selectedReceivable.id) return r;
      const newCollected = r.collectedAmount + collectAmount;
      const newBalance = r.totalInvoice - newCollected;
      return {
        ...r,
        collectedAmount: newCollected,
        balance: newBalance
      };
    }));

    setSelectedReceivable(null);
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              04. Módulo de Cartera y Cuentas por Cobrar Comerciales
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Control de derechos de cobro originados en ventas a crédito conforme a <strong>NIIF 9</strong> y <strong>NIIF para las PYMES Sección 11</strong>. Monitoreo de plazos comerciales, gestión de recaudo bancario y estratificación por edades de vencimiento.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdvanceToProvisions}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Avanzar al Módulo de Provisiones</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Facturación Total Bruta Emitida</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalPortfolioGross)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            {receivables.length} facturas comerciales generadas
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Recaudos Ingresados a Bancos</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
            Débito Bancos 111005 / Crédito Clientes 130505
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Saldo Pendiente de Cobro (Cartera Activa)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {formatCurrency(totalBalanceDue)}
          </div>
          <span className="text-[11px] text-indigo-800 font-medium mt-1 inline-block">
            Saldo en Libros Cuenta 1305 (Sujeto a Deterioro)
          </span>
        </div>
      </div>

      {/* Aging Stratification Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Estratificación de Cartera por Edades de Vencimiento
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Base para Deterioro NIIF 9</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-emerald-50/60 p-3 rounded border border-emerald-200 text-center">
            <span className="text-[11px] font-medium text-emerald-800 block">Vigente (Sin Vencer)</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(agingVigente)}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">Riesgo Bajo</span>
          </div>

          <div className="bg-blue-50/60 p-3 rounded border border-blue-200 text-center">
            <span className="text-[11px] font-medium text-blue-800 block">1 a 30 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(aging1_30)}
            </span>
            <span className="text-[10px] text-blue-700 font-medium mt-0.5 block">Alerta Temprana</span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded border border-amber-200 text-center">
            <span className="text-[11px] font-medium text-amber-800 block">31 a 60 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(aging31_60)}
            </span>
            <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">Cobro Pre-jurídico</span>
          </div>

          <div className="bg-orange-50/60 p-3 rounded border border-orange-200 text-center">
            <span className="text-[11px] font-medium text-orange-800 block">61 a 90 Días</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block mt-1">
              {formatCurrency(aging61_90)}
            </span>
            <span className="text-[10px] text-orange-700 font-medium mt-0.5 block">Riesgo Alto</span>
          </div>

          <div className="bg-rose-50/60 p-3 rounded border border-rose-200 text-center">
            <span className="text-[11px] font-medium text-rose-800 block">&gt; 90 Días (Morosa)</span>
            <span className="font-mono tabular-nums font-bold text-rose-700 text-sm block mt-1">
              {formatCurrency(agingMas90)}
            </span>
            <span className="text-[10px] text-rose-700 font-medium mt-0.5 block">Deterioro Crítico</span>
          </div>
        </div>
      </div>

      {/* Table: Invoices */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Libro Auxiliar de Clientes y Cuentas por Cobrar (Cuenta 130505)
          </h2>
          <span className="text-xs text-slate-500">Haz clic en "Registrar Abono" para simular un recaudo bancario</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">No. Factura</th>
                <th className="py-2.5 px-3">Cliente / Razón Social</th>
                <th className="py-2.5 px-3">Fecha Emisión</th>
                <th className="py-2.5 px-3">Fecha Vence</th>
                <th className="py-2.5 px-3 text-center">Días Mora</th>
                <th className="py-2.5 px-3 text-right">Total Factura</th>
                <th className="py-2.5 px-3 text-right">Recaudado</th>
                <th className="py-2.5 px-3 text-right">Saldo en Libros</th>
                <th className="py-2.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {receivables.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{rec.invoiceNumber}</td>
                  <td className="py-3 px-3 font-sans text-slate-800">
                    <div>{rec.clientName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.clientNit}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-sans">{rec.issueDate}</td>
                  <td className="py-3 px-3 text-slate-600 font-sans">{rec.dueDate}</td>
                  <td className="py-3 px-3 text-center">
                    {rec.daysOverdue <= 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-sans">
                        Al día
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                        {rec.daysOverdue} días
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(rec.totalInvoice)}</td>
                  <td className="py-3 px-3 text-right text-emerald-600 font-medium">{formatCurrency(rec.collectedAmount)}</td>
                  <td className="py-3 px-3 text-right font-bold text-indigo-700">{formatCurrency(rec.balance)}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    {rec.balance > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedReceivable(rec);
                          setCollectAmount(Math.min(rec.balance, 5000000));
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                      >
                        Registrar Abono
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-medium text-[11px] flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Pagada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <td colSpan={5} className="py-3 px-4 font-sans text-slate-900">TOTALES CARTERA</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(totalPortfolioGross)}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">{formatCurrency(totalCollected)}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-700 text-sm">{formatCurrency(totalBalanceDue)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Docente Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>Cátedra del Docente: La Cartera Comercial y el Riesgo de Crédito</span>
        </div>
        <p className="leading-relaxed">
          Las Cuentas por Cobrar representan un <strong>activo financiero</strong> medido al costo amortizado. En el momento en que se factura a crédito, se reconoce el ingreso contable (principio de causación), pero el dinero real aún no ha ingresado al banco. Si un cliente incurre en morosidad prolongada, las normas internacionales obligan a no sobreestimar el activo y reconocer inmediatamente un <strong>gasto por deterioro (provisión)</strong>, como veremos en el siguiente módulo.
        </p>
      </div>

      {/* Modal: Registrar Abono */}
      {selectedReceivable && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Registrar Recaudo de Cartera
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Factura: <strong className="text-slate-800">{selectedReceivable.invoiceNumber}</strong> · {selectedReceivable.clientName}
            </p>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Saldo Pendiente Actual</label>
                <div className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(selectedReceivable.balance)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Monto a Recaudar ($ COP)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedReceivable.balance}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-[11px] text-indigo-950">
                <strong>Asiento Contable que se Generará:</strong>
                <p className="mt-0.5">
                  Débito a Bancos (111005) por {formatCurrency(collectAmount)} y Crédito a Clientes (130505) por el mismo valor.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceivable(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Confirmar Recaudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
