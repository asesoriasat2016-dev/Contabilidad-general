import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Layers, 
  Search, 
  Filter, 
  FileText,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { JournalEntry } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface LedgerJournalModuleProps {
  entries: JournalEntry[];
  trialBalanceItems: any[];
}

export const LedgerJournalModule: React.FC<LedgerJournalModuleProps> = ({
  entries,
  trialBalanceItems
}) => {
  const [viewMode, setViewMode] = useState<'DIARIO' | 'CUENTAS_T'>('DIARIO');
  const [filterModule, setFilterModule] = useState<string>('TODOS');
  const [searchAccount, setSearchAccount] = useState<string>('');

  const filteredEntries = entries.filter(e => {
    if (filterModule !== 'TODOS' && e.sourceModule !== filterModule) return false;
    return true;
  });

  const totalDebits = entries.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.debit, 0), 0);
  const totalCredits = entries.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.credit, 0), 0);

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Libro Diario Columnar y Libro Mayor (Cuentas T)
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Registro cronológico inalterable de todos los hechos económicos del periodo contable en partida doble, y su mayorización en esquemas T para verificar la procedencia de cada saldo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md shadow-2xs border border-slate-200 p-0.5 bg-slate-100">
              <button
                onClick={() => setViewMode('DIARIO')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  viewMode === 'DIARIO'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Libro Diario Columnar
              </button>
              <button
                onClick={() => setViewMode('CUENTAS_T')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  viewMode === 'CUENTAS_T'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Esquema de Cuentas T (Mayor)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters */}
      {viewMode === 'DIARIO' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Filtrar por Ciclo / Módulo:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
            >
              <option value="TODOS">Todos los Módulos ({entries.length} Comprobantes)</option>
              <option value="CONSTITUCION">Constitución y Apertura</option>
              <option value="INVENTARIO">Inventarios y Compras</option>
              <option value="CARTERA">Ventas y Cartera</option>
              <option value="NOMINA">Nómina y Prestaciones</option>
              <option value="PROVISION">Provisiones y Deterioro</option>
              <option value="AJUSTE">Ajustes de Periodo</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-mono">Sumas Iguales:</span>
            <strong className="font-mono text-emerald-700">{formatCurrency(totalDebits)}</strong>
            <span className="text-slate-300">|</span>
            <strong className="font-mono text-indigo-700">{formatCurrency(totalCredits)}</strong>
          </div>
        </div>
      )}

      {/* VIEW 1: LIBRO DIARIO COLUMNAR */}
      {viewMode === 'DIARIO' && (
        <div className="space-y-6">
          {filteredEntries.map((entry, index) => {
            const entryDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
            const entryCredit = entry.lines.reduce((s, l) => s + l.credit, 0);

            return (
              <div
                key={entry.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      Comp. #{index + 1}
                    </span>
                    <h3 className="font-bold text-slate-900">{entry.concept}</h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>Fecha: <strong>{entry.date}</strong></span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold font-sans">
                      {entry.sourceModule}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200 font-sans">
                        <th className="py-2 px-3 text-left">Código PUC</th>
                        <th className="py-2 px-3 text-left">Cuenta Contable</th>
                        <th className="py-2 px-3 text-left">Detalle / Explicación del Registro</th>
                        <th className="py-2 px-3 text-right">Débito ($)</th>
                        <th className="py-2 px-3 text-right">Crédito ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entry.lines.map((line, lIdx) => (
                        <tr key={lIdx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{line.accountCode}</td>
                          <td className="py-2 px-3 font-sans text-slate-900 font-medium">{line.accountName}</td>
                          <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{line.description || '-'}</td>
                          <td className="py-2 px-3 text-right text-slate-900">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right text-indigo-700">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                        <td colSpan={3} className="py-2 px-3 font-sans text-slate-700 text-right">
                          SUMAS IGUALES DEL COMPROBANTE:
                        </td>
                        <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(entryDebit)}</td>
                        <td className="py-2 px-3 text-right text-indigo-700">{formatCurrency(entryCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ESQUEMA DE CUENTAS T (LIBRO MAYOR) */}
      {viewMode === 'CUENTAS_T' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Mayorización de cuentas activas en el periodo contable.
            </span>
            <input
              type="text"
              placeholder="Buscar cuenta por código o nombre..."
              value={searchAccount}
              onChange={(e) => setSearchAccount(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trialBalanceItems
              .filter(item => {
                if (!searchAccount) return true;
                return item.code.includes(searchAccount) || item.name.toLowerCase().includes(searchAccount.toLowerCase());
              })
              .map(item => {
                // Find all debit and credit movements for this account
                const debitMoves: number[] = [];
                const creditMoves: number[] = [];

                entries.forEach(e => {
                  e.lines.forEach(l => {
                    if (l.accountCode === item.code) {
                      if (l.debit > 0) debitMoves.push(l.debit);
                      if (l.credit > 0) creditMoves.push(l.credit);
                    }
                  });
                });

                return (
                  <div
                    key={item.code}
                    className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs"
                  >
                    {/* T header */}
                    <div className="bg-slate-800 text-white p-3 text-center">
                      <span className="font-mono text-[11px] text-slate-300 block">{item.code}</span>
                      <h3 className="font-bold text-xs truncate" title={item.name}>{item.name}</h3>
                    </div>

                    {/* T Column headers */}
                    <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-slate-300 bg-slate-100 py-1 text-slate-700">
                      <div className="border-r border-slate-300">DEBE (Débitos)</div>
                      <div>HABER (Créditos)</div>
                    </div>

                    {/* T Body */}
                    <div className="grid grid-cols-2 text-xs font-mono min-h-[140px] text-[11px]">
                      {/* Left: DEBE */}
                      <div className="border-r border-slate-300 p-2 space-y-1 text-right divide-y divide-slate-100">
                        {debitMoves.map((m, idx) => (
                          <div key={idx} className="text-slate-800 pt-0.5">{formatCurrency(m)}</div>
                        ))}
                      </div>

                      {/* Right: HABER */}
                      <div className="p-2 space-y-1 text-right divide-y divide-slate-100">
                        {creditMoves.map((m, idx) => (
                          <div key={idx} className="text-slate-800 pt-0.5">{formatCurrency(m)}</div>
                        ))}
                      </div>
                    </div>

                    {/* T Foot totals */}
                    <div className="border-t-2 border-slate-400 grid grid-cols-2 text-xs font-mono font-bold bg-slate-50 py-1.5 px-2">
                      <div className="border-r border-slate-300 text-right pr-2 text-slate-900">
                        {formatCurrency(item.debit)}
                      </div>
                      <div className="text-right text-indigo-700">
                        {formatCurrency(item.credit)}
                      </div>
                    </div>

                    {/* Final Balance Box */}
                    <div className="p-2.5 bg-indigo-50/70 border-t border-indigo-100 text-center text-xs">
                      <span className="text-[10px] text-indigo-800 font-semibold block uppercase">
                        Saldo Final: {item.balanceDebit > 0 ? 'DÉBITO' : 'CRÉDITO'}
                      </span>
                      <span className="font-mono font-bold text-indigo-900 text-sm">
                        {formatCurrency(item.balanceDebit > 0 ? item.balanceDebit : item.balanceCredit)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
