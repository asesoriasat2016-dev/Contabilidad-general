import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingDown, 
  Plus, 
  ArrowRight, 
  Info, 
  Layers, 
  FileSpreadsheet,
  CheckCircle2,
  BookOpenCheck
} from 'lucide-react';
import { InventoryItem, KardexEntry, MovementType } from '../types/accounting';
import { formatCurrency, formatNumber } from '../utils/accountingCalculations';

interface InventoryKardexModuleProps {
  items: InventoryItem[];
  kardex: KardexEntry[];
  setKardex: React.Dispatch<React.SetStateAction<KardexEntry[]>>;
  onAdvanceToReceivables: () => void;
}

export const InventoryKardexModule: React.FC<InventoryKardexModuleProps> = ({
  items,
  kardex,
  setKardex,
  onAdvanceToReceivables
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || 'item-1');
  const [valuationMethod, setValuationMethod] = useState<'PROMEDIO' | 'PEPS'>('PROMEDIO');
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);

  const [transType, setTransType] = useState<'COMPRA' | 'VENTA'>('COMPRA');
  const [transQty, setTransQty] = useState<number>(5);
  const [transUnitCost, setTransUnitCost] = useState<number>(2150000);
  const [transDoc, setTransDoc] = useState<string>('Factura FC-1050 Mayorista');

  const selectedItem = items.find(i => i.id === selectedItemId) || items[0];
  const itemKardex = kardex.filter(k => k.itemId === selectedItemId);

  // Totals for this item
  const latestEntry = itemKardex[itemKardex.length - 1];
  const currentStock = latestEntry ? latestEntry.balanceQty : 0;
  const currentAvgCost = latestEntry ? latestEntry.balanceUnitCost : 0;
  const currentTotalVal = latestEntry ? latestEntry.balanceTotal : 0;

  const totalCostOfSalesThisItem = itemKardex.reduce((s, k) => s + k.outTotal, 0);

  // Global inventory total across all items
  const totalInventoryValueAll = items.reduce((sum, itm) => {
    const itmKardex = kardex.filter(k => k.itemId === itm.id);
    const last = itmKardex[itmKardex.length - 1];
    return sum + (last ? last.balanceTotal : 0);
  }, 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (transQty <= 0) return;

    const last = itemKardex[itemKardex.length - 1];
    const prevQty = last ? last.balanceQty : 0;
    const prevCost = last ? last.balanceUnitCost : 0;
    const prevTotal = last ? last.balanceTotal : 0;

    let inQty = 0, inUnitCost = 0, inTotal = 0;
    let outQty = 0, outUnitCost = 0, outTotal = 0;
    let balanceQty = 0, balanceUnitCost = 0, balanceTotal = 0;

    if (transType === 'COMPRA') {
      inQty = transQty;
      inUnitCost = transUnitCost;
      inTotal = inQty * inUnitCost;

      balanceQty = prevQty + inQty;
      balanceTotal = prevTotal + inTotal;
      balanceUnitCost = balanceQty > 0 ? balanceTotal / balanceQty : 0;
    } else {
      // Venta
      if (transQty > prevQty) {
        alert(`No hay stock suficiente para realizar esta venta. Stock disponible: ${prevQty} unidades.`);
        return;
      }
      outQty = transQty;
      outUnitCost = prevCost; // Promedio ponderado al momento de salida
      outTotal = outQty * outUnitCost;

      balanceQty = prevQty - outQty;
      balanceTotal = prevTotal - outTotal;
      balanceUnitCost = balanceQty > 0 ? balanceTotal / balanceQty : prevCost;
    }

    const newKardexEntry: KardexEntry = {
      id: `kardex-${Date.now()}`,
      date: '2026-03-28',
      itemId: selectedItemId,
      documentRef: transDoc,
      type: transType,
      inQty,
      inUnitCost,
      inTotal,
      outQty,
      outUnitCost,
      outTotal,
      balanceQty,
      balanceUnitCost,
      balanceTotal
    };

    setKardex(prev => [...prev, newKardexEntry]);
    setShowTransactionModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              03. Módulo de Inventarios y Control Permanente en Kardex
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Administración de existencias bajo la <strong>NIC 2 / NIIF para las PYMES Sección 13</strong>. Valuación continua mediante Promedio Ponderado Móvil, segregación de costos de compra e imputación estricta al Costo de Ventas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Registrar Compra / Venta</span>
            </button>
            <button
              onClick={onAdvanceToReceivables}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Continuar al Módulo de Cartera</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Valor Total en Bodega (Global)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalInventoryValueAll)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Cuenta 143505 (Activo Corriente)
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Stock Actual del Producto Seleccionado</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {currentStock} <span className="text-xs font-normal text-slate-500">{selectedItem.unit}s</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 inline-block">
            {selectedItem.name}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Costo Promedio Unitario Vigente</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-600 mt-1">
            {formatCurrency(currentAvgCost)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Precio de venta base: {formatCurrency(selectedItem.sellingPrice)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Costo de Ventas Acumulado (Kardex)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalCostOfSalesThisItem)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Cuenta 6135 (Estado de Resultados)
          </span>
        </div>
      </div>

      {/* Control Toolbar: Item selector and Valuation method */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Producto a Inspeccionar:</label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
          >
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Método de Valuación NIIF:</span>
          <div className="inline-flex rounded-md shadow-2xs border border-slate-200 p-0.5 bg-slate-100">
            <button
              onClick={() => setValuationMethod('PROMEDIO')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                valuationMethod === 'PROMEDIO'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Promedio Ponderado Móvil
            </button>
            <button
              onClick={() => setValuationMethod('PEPS')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                valuationMethod === 'PEPS'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PEPS (Primeras en Entrar)
            </button>
          </div>
        </div>
      </div>

      {/* Kardex Multi-Column Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Tarjeta de Kardex Permanente: {selectedItem.name} ({selectedItem.code})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Unidad: {selectedItem.unit}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold text-center">
                <th colSpan={3} className="py-2 px-3 border-r border-slate-300 text-left">DATOS DE LA OPERACIÓN</th>
                <th colSpan={3} className="py-2 px-3 border-r border-slate-300 bg-emerald-50 text-emerald-900">ENTRADAS (COMPRAS / APORTES)</th>
                <th colSpan={3} className="py-2 px-3 border-r border-slate-300 bg-rose-50 text-rose-900">SALIDAS (VENTAS AL COSTO)</th>
                <th colSpan={3} className="py-2 px-3 bg-indigo-50 text-indigo-900">SALDOS EN EXISTENCIA</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Documento Soporte</th>
                <th className="py-2 px-3 text-left border-r border-slate-300">Tipo</th>
                
                {/* Entradas */}
                <th className="py-2 px-2 text-right bg-emerald-50/40">Cant.</th>
                <th className="py-2 px-2 text-right bg-emerald-50/40">Vr. Unit</th>
                <th className="py-2 px-3 text-right bg-emerald-50/40 border-r border-slate-300">Total COP</th>
                
                {/* Salidas */}
                <th className="py-2 px-2 text-right bg-rose-50/40">Cant.</th>
                <th className="py-2 px-2 text-right bg-rose-50/40">Vr. Unit</th>
                <th className="py-2 px-3 text-right bg-rose-50/40 border-r border-slate-300">Total COP</th>
                
                {/* Saldos */}
                <th className="py-2 px-2 text-right bg-indigo-50/40">Cant.</th>
                <th className="py-2 px-2 text-right bg-indigo-50/40">Costo Prom.</th>
                <th className="py-2 px-3 text-right bg-indigo-50/40">Total COP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {itemKardex.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{k.date}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-sans max-w-xs truncate" title={k.documentRef}>
                    {k.documentRef}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      k.type === 'COMPRA' || k.type === 'INVENTARIO_INICIAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {k.type}
                    </span>
                  </td>

                  {/* Entradas */}
                  <td className="py-2.5 px-2 text-right bg-emerald-50/20 text-slate-700">
                    {k.inQty > 0 ? k.inQty : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right bg-emerald-50/20 text-slate-700">
                    {k.inQty > 0 ? formatCurrency(k.inUnitCost) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right bg-emerald-50/20 border-r border-slate-300 font-bold text-slate-900">
                    {k.inTotal > 0 ? formatCurrency(k.inTotal) : '-'}
                  </td>

                  {/* Salidas */}
                  <td className="py-2.5 px-2 text-right bg-rose-50/20 text-slate-700">
                    {k.outQty > 0 ? k.outQty : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right bg-rose-50/20 text-slate-700">
                    {k.outQty > 0 ? formatCurrency(k.outUnitCost) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right bg-rose-50/20 border-r border-slate-300 font-bold text-rose-700">
                    {k.outTotal > 0 ? formatCurrency(k.outTotal) : '-'}
                  </td>

                  {/* Saldos */}
                  <td className="py-2.5 px-2 text-right bg-indigo-50/20 font-bold text-slate-900">
                    {k.balanceQty}
                  </td>
                  <td className="py-2.5 px-2 text-right bg-indigo-50/20 text-indigo-900">
                    {formatCurrency(k.balanceUnitCost)}
                  </td>
                  <td className="py-2.5 px-3 text-right bg-indigo-50/20 font-bold text-indigo-700">
                    {formatCurrency(k.balanceTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <td colSpan={3} className="py-2.5 px-3 font-sans text-slate-900">SALDO FINAL DEL ARTÍCULO</td>
                <td colSpan={3} className="border-r border-slate-300"></td>
                <td colSpan={3} className="border-r border-slate-300 text-right pr-3 font-mono text-rose-700">
                  Costo Ventas: {formatCurrency(totalCostOfSalesThisItem)}
                </td>
                <td className="py-2.5 px-2 text-right font-mono">{currentStock} und</td>
                <td className="py-2.5 px-2 text-right font-mono text-indigo-700">{formatCurrency(currentAvgCost)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-indigo-700 text-sm">
                  {formatCurrency(currentTotalVal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Docente Masterclass: NIC 2 y Prohibición de UEPS */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-5 text-xs text-indigo-950 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <BookOpenCheck className="w-4 h-4 text-indigo-700" />
          <span>Cátedra del Docente: ¿Por qué la NIC 2 prohíbe taxativamente el método UEPS (LIFO)?</span>
        </div>

        <p className="leading-relaxed text-indigo-900/90">
          En los estándares contables internacionales (NIC 2 / NIIF para las PYMES Sección 13.18), solo se permiten las fórmulas de costo <strong>PEPS (Primeras en Entrar, Primeras en Salir)</strong> y <strong>Promedio Ponderado</strong>. El método UEPS (Últimas en Entrar, Primeras en Salir) quedó expresamente prohibido debido a dos distorsiones fundamentales:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white/80 p-3 rounded border border-indigo-200">
            <strong className="block text-indigo-900 mb-1">1. Subvaluación del Activo en el Balance:</strong>
            <p className="text-indigo-900/80 leading-relaxed">
              En economías inflacionarias, valorar los inventarios finales con los costos más antiguos deja el activo subvaluado y desconectado del valor real de reposición o realización.
            </p>
          </div>
          <div className="bg-white/80 p-3 rounded border border-indigo-200">
            <strong className="block text-indigo-900 mb-1">2. Manipulación de Resultados Fiscales:</strong>
            <p className="text-indigo-900/80 leading-relaxed">
              Al cargar al costo de ventas las compras más recientes y caras, se reducía artificialmente la utilidad contable y gravable del ejercicio fiscal.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Registrar Compra o Venta */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Registrar Movimiento de Inventario
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tipo de Operación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransType('COMPRA')}
                    className={`py-2 text-center rounded border font-semibold ${
                      transType === 'COMPRA'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Compra (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransType('VENTA')}
                    className={`py-2 text-center rounded border font-semibold ${
                      transType === 'VENTA'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Venta (Salida al Costo)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Documento Soporte / Comprobante</label>
                <input
                  type="text"
                  required
                  value={transDoc}
                  onChange={(e) => setTransDoc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  placeholder="Ej: Factura FC-1090"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cantidad de Unidades</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={transQty}
                    onChange={(e) => setTransQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                {transType === 'COMPRA' ? (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Costo Unitario de Compra ($)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={transUnitCost}
                      onChange={(e) => setTransUnitCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Costo Salida Aplicado ($)</label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(currentAvgCost)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded text-xs font-mono text-slate-600"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                <strong>Efecto Contable Automático:</strong>
                <p className="mt-0.5">
                  {transType === 'COMPRA'
                    ? `Débito Inventarios (1435) por ${formatCurrency(transQty * transUnitCost)}, Débito IVA descontable 19%, y Crédito a Proveedores (2205).`
                    : `Débito Costo de Ventas (6135) por ${formatCurrency(transQty * currentAvgCost)} y Crédito a Inventarios (1435).`}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Asentar en Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
