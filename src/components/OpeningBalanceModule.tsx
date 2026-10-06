import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Users, 
  FileCheck2, 
  HelpCircle, 
  TrendingUp, 
  BookOpenCheck,
  CheckCircle2
} from 'lucide-react';
import { OpeningPartnerContribution } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface OpeningBalanceModuleProps {
  partners: OpeningPartnerContribution[];
  setPartners: React.Dispatch<React.SetStateAction<OpeningPartnerContribution[]>>;
  onAdvanceToInventory: () => void;
}

export const OpeningBalanceModule: React.FC<OpeningBalanceModuleProps> = ({
  partners,
  setPartners,
  onAdvanceToInventory
}) => {
  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [newPartner, setNewPartner] = useState<OpeningPartnerContribution>({
    id: `socio-${Date.now()}`,
    partnerName: '',
    partnerDoc: '',
    sharesOrQuotas: 1000,
    nominalValue: 10000,
    cashContribution: 10000000,
    inventoryContribution: 0,
    equipmentContribution: 0,
    propertyContribution: 0,
    otherAssetsContribution: 0,
    liabilityAssumed: 0,
    netContribution: 10000000
  });

  // Calculate totals
  const totalCash = partners.reduce((s, p) => s + p.cashContribution, 0);
  const totalInventory = partners.reduce((s, p) => s + p.inventoryContribution, 0);
  const totalEquipment = partners.reduce((s, p) => s + p.equipmentContribution, 0);
  const totalProperty = partners.reduce((s, p) => s + p.propertyContribution, 0);
  const totalLiabilitiesAssumed = partners.reduce((s, p) => s + p.liabilityAssumed, 0);
  
  const totalAssets = totalCash + totalInventory + totalEquipment + totalProperty;
  const totalLiabilities = totalLiabilitiesAssumed;
  const totalEquity = totalAssets - totalLiabilities;

  const totalShares = partners.reduce((s, p) => s + p.sharesOrQuotas, 0);

  const handleUpdatePartner = (id: string, field: keyof OpeningPartnerContribution, value: number | string) => {
    setPartners(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      const net = (
        Number(updated.cashContribution || 0) +
        Number(updated.inventoryContribution || 0) +
        Number(updated.equipmentContribution || 0) +
        Number(updated.propertyContribution || 0) +
        Number(updated.otherAssetsContribution || 0) -
        Number(updated.liabilityAssumed || 0)
      );
      return { ...updated, netContribution: net };
    }));
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 1) {
      alert('Debe existir al menos un socio en la sociedad.');
      return;
    }
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.partnerName) return;
    const net = (
      Number(newPartner.cashContribution || 0) +
      Number(newPartner.inventoryContribution || 0) +
      Number(newPartner.equipmentContribution || 0) +
      Number(newPartner.propertyContribution || 0) -
      Number(newPartner.liabilityAssumed || 0)
    );
    setPartners(prev => [...prev, { ...newPartner, netContribution: net, id: `socio-${Date.now()}` }]);
    setShowAddPartnerModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Module Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              02. Balance de Apertura y Ecuación Patrimonial Fundamental
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Registro del acto fundacional contable. Valora los aportes en dinero y en especie (inventario, equipos, muebles) realizados por cada accionista, verificando el equilibrio exacto de la ecuación: <code>Activo = Pasivo + Patrimonio</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Añadir Accionista</span>
            </button>
            <button
              onClick={onAdvanceToInventory}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Avanzar al Módulo de Inventarios</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer: The Fundamental Accounting Equation */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">
              PRINCIPIO FUNDAMENTAL: DEMOSTRACIÓN DE LA ECUACIÓN PATRIMONIAL
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sumas Iguales Garantizadas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Activo Box */}
          <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>TOTAL ACTIVOS (DEBE)</span>
              <span className="text-slate-500 font-mono">100% Recursos</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {formatCurrency(totalAssets)}
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-700/60 font-mono">
              <div className="flex justify-between">
                <span>Efectivo en Bancos (1110):</span>
                <span>{formatCurrency(totalCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inventarios Bodega (1435):</span>
                <span>{formatCurrency(totalInventory)}</span>
              </div>
              <div className="flex justify-between">
                <span>Equipos de Cómputo (1528):</span>
                <span>{formatCurrency(totalEquipment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Muebles y Enseres (1524):</span>
                <span>{formatCurrency(totalProperty)}</span>
              </div>
            </div>
          </div>

          {/* Pasivo Box */}
          <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>TOTAL PASIVOS (HABER)</span>
              <span className="text-slate-500 font-mono">Obligaciones</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-200">
              {formatCurrency(totalLiabilities)}
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
              {totalLiabilities === 0 
                ? 'La sociedad inicia sin deudas asumidas con terceros. El 100% del activo es financiado con patrimonio de los accionistas.' 
                : 'Deudas o créditos transferidos por los socios al momento del aporte.'}
            </p>
          </div>

          {/* Patrimonio Box */}
          <div className="bg-slate-800/80 p-5 rounded-lg border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
              <span>TOTAL PATRIMONIO (HABER)</span>
              <span className="text-indigo-400 font-mono">Capital Social</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-indigo-300">
              {formatCurrency(totalEquity)}
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5 pt-2 border-t border-slate-700/60 font-mono">
              <div className="flex justify-between">
                <span>Acciones Suscritas:</span>
                <span>{totalShares.toLocaleString()} acc.</span>
              </div>
              <div className="flex justify-between">
                <span>Capital Pagado (3105):</span>
                <span className="text-indigo-300 font-semibold">{formatCurrency(totalEquity)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Diferencia de Cuadre:</span>
                <span className="text-emerald-400">$0 COP (Exacto)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Desglose de Accionistas y Aportes */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Libro de Registro de Accionistas y Cuadro de Aportes</span>
            </h2>
            <p className="text-xs text-slate-500">
              Permite modificar en tiempo real el valor asignado a cada tipo de bien aportado.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {partners.length} Accionistas Registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Accionista / Documento</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
                <th className="py-2.5 px-3 text-right">Efectivo (Davivienda)</th>
                <th className="py-2.5 px-3 text-right">Inventario Bodega</th>
                <th className="py-2.5 px-3 text-right">Equipos Cómputo</th>
                <th className="py-2.5 px-3 text-right">Muebles / Enseres</th>
                <th className="py-2.5 px-4 text-right">Aporte Neto</th>
                <th className="py-2.5 px-3 text-center">Part. %</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner) => {
                const partPercent = totalEquity > 0 ? ((partner.netContribution / totalEquity) * 100).toFixed(1) : '0';
                return (
                  <tr key={partner.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{partner.partnerName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{partner.partnerDoc}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {partner.sharesOrQuotas.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      <input
                        type="number"
                        value={partner.cashContribution}
                        onChange={(e) => handleUpdatePartner(partner.id, 'cashContribution', Number(e.target.value))}
                        className="w-28 text-right px-1.5 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      <input
                        type="number"
                        value={partner.inventoryContribution}
                        onChange={(e) => handleUpdatePartner(partner.id, 'inventoryContribution', Number(e.target.value))}
                        className="w-28 text-right px-1.5 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      <input
                        type="number"
                        value={partner.equipmentContribution}
                        onChange={(e) => handleUpdatePartner(partner.id, 'equipmentContribution', Number(e.target.value))}
                        className="w-28 text-right px-1.5 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      <input
                        type="number"
                        value={partner.propertyContribution}
                        onChange={(e) => handleUpdatePartner(partner.id, 'propertyContribution', Number(e.target.value))}
                        className="w-28 text-right px-1.5 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatCurrency(partner.netContribution)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-indigo-700 font-semibold">
                      {partPercent}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleRemovePartner(partner.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Eliminar accionista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4">TOTALES APORTES</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{totalShares.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(totalCash)}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(totalInventory)}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(totalEquipment)}</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(totalProperty)}</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-indigo-700 text-sm">
                  {formatCurrency(totalEquity)}
                </td>
                <td className="py-3 px-3 text-center font-mono">100.0%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Grid: Asiento Contable de Apertura & Didáctica Docente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Asiento Contable Oficial */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Comprobante de Diario No. 001: Asiento de Apertura
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Fecha: 01/03/2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3 text-left">Código PUC</th>
                  <th className="py-2 px-3 text-left">Cuenta Contable (NIIF)</th>
                  <th className="py-2 px-3 text-right">Débito (Debe)</th>
                  <th className="py-2 px-3 text-right">Crédito (Haber)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {totalCash > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">111005</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Bancos Nacionales (Davivienda)</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalCash)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  </tr>
                )}
                {totalInventory > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">143505</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Mercancías no Fabricadas (Inventario)</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalInventory)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  </tr>
                )}
                {totalEquipment > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">152805</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Equipos de Procesamiento de Datos</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalEquipment)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  </tr>
                )}
                {totalProperty > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-700">152405</td>
                    <td className="py-2 px-3 font-sans text-slate-800">Muebles y Enseres de Oficina</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalProperty)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">310505</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Capital Suscrito y Pagado</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(totalEquity)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold font-mono text-xs border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">SUMAS IGUALES DE APERTURA</td>
                  <td className="py-2.5 px-3 text-right text-slate-900">{formatCurrency(totalAssets)}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-700">{formatCurrency(totalEquity)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Cátedra Docente Explicativa */}
        <div className="lg:col-span-5 bg-amber-50/60 border border-amber-200/80 rounded-lg p-5 text-xs text-amber-950 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>Cátedra del Docente: ¿Por qué el Capital Social se Acredita?</span>
          </div>

          <p className="leading-relaxed text-amber-900/90">
            Una de las dudas más frecuentes de los estudiantes de contabilidad es: <em>"Si los socios aportaron dinero y bienes que entraron a la empresa, ¿por qué el capital no va en el Debe?"</em>
          </p>

          <div className="space-y-2 bg-white/70 p-3 rounded border border-amber-200">
            <p className="font-semibold text-amber-900">
              1. Principio de Entidad Contable Autónoma:
            </p>
            <p className="text-amber-900/80">
              La empresa es una persona jurídica distinta de sus dueños. La empresa <strong>recibe</strong> los activos físicos (Débito en bancos, inventarios, activos fijos) y simultáneamente <strong>reconoce una deuda moral y patrimonial</strong> con los accionistas (Crédito en cuenta 3105 Capital).
            </p>

            <p className="font-semibold text-amber-900 pt-1">
              2. Dinámica de la Partida Doble:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/80">
              <li><strong>Todo aumento de Activo se debita</strong> (+ Recursos disponibles).</li>
              <li><strong>Todo aumento de Patrimonio se acredita</strong> (+ Obligación residual hacia accionistas).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Añadir Socio */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Registrar Nuevo Accionista y Aportes
            </h3>
            <form onSubmit={handleAddPartnerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nombre Completo o Razón Social</label>
                <input
                  type="text"
                  required
                  value={newPartner.partnerName}
                  onChange={(e) => setNewPartner({ ...newPartner, partnerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  placeholder="Ej: Inversiones del Valle S.A."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Documento / NIT</label>
                  <input
                    type="text"
                    required
                    value={newPartner.partnerDoc}
                    onChange={(e) => setNewPartner({ ...newPartner, partnerDoc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                    placeholder="C.C. o NIT"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Número de Acciones</label>
                  <input
                    type="number"
                    required
                    value={newPartner.sharesOrQuotas}
                    onChange={(e) => setNewPartner({ ...newPartner, sharesOrQuotas: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Aporte en Efectivo ($)</label>
                  <input
                    type="number"
                    value={newPartner.cashContribution}
                    onChange={(e) => setNewPartner({ ...newPartner, cashContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Aporte en Inventario ($)</label>
                  <input
                    type="number"
                    value={newPartner.inventoryContribution}
                    onChange={(e) => setNewPartner({ ...newPartner, inventoryContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Aporte Equipos Cómputo ($)</label>
                  <input
                    type="number"
                    value={newPartner.equipmentContribution}
                    onChange={(e) => setNewPartner({ ...newPartner, equipmentContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Aporte Muebles / Enseres ($)</label>
                  <input
                    type="number"
                    value={newPartner.propertyContribution}
                    onChange={(e) => setNewPartner({ ...newPartner, propertyContribution: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Guardar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
