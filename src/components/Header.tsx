import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Printer, 
  Scale, 
  BookOpenCheck,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { ActiveTab, CompanyProfile } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface HeaderProps {
  company: CompanyProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBalanced: boolean;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  onOpenMasterclass: () => void;
  onPrintReport: () => void;
  onResetCase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  activeTab,
  setActiveTab,
  isBalanced,
  totalAssets,
  totalLiabilitiesAndEquity,
  onOpenMasterclass,
  onPrintReport,
  onResetCase,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://share.gemini.google/x5sTxBSgy0hn";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navTabs: { id: ActiveTab; label: string }[] = [
    { id: 'LEGAL', label: '1. Constitución' },
    { id: 'APERTURA', label: '2. Apertura' },
    { id: 'INVENTARIOS', label: '3. Inventarios' },
    { id: 'CARTERA', label: '4. Cartera' },
    { id: 'PROVISIONES', label: '5. Provisiones' },
    { id: 'NOMINA', label: '6. Nómina' },
    { id: 'AJUSTES', label: '7. Ajustes' },
    { id: 'ESTADOS_FINANCIEROS', label: '8. Estados Financieros' },
    { id: 'LIBRO_DIARIO', label: 'Libro Diario' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Reference Bar with Gemini Share Link */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Referencia / Sesión de Cátedra:</span>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/50 hover:decoration-indigo-300 flex items-center gap-1 transition-colors"
              title="Abrir enlace de consulta en una nueva pestaña"
            >
              <span>{shareUrl}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copiar enlace al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Simulador Docente en Contabilidad y Finanzas
            </span>
          </div>
        </div>
      </div>

      {/* Zone 1, 2, 3 Navigation Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Title with Modern Logo */}
          <div className="flex items-center gap-3">
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); setActiveTab('LEGAL'); }}
              className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2.5 group"
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200/80 shadow-2xs bg-white flex items-center justify-center shrink-0">
                <img
                  src="/src/assets/images/logo_praxis_contable_1791302757694.jpg"
                  alt="Logo PraxisContable - Contabilidad y Finanzas Pedagógicas"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  PraxisContable
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none hidden sm:inline">
                  Finanzas Pedagógicas
                </span>
              </div>
            </a>
            <span className="hidden lg:inline text-xs font-mono text-slate-300">|</span>
            <span className="hidden lg:inline text-xs font-medium text-slate-600 truncate max-w-[180px]">
              {company.name}
            </span>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2">
            {navTabs.slice(0, 8).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Direct Gemini Link button */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors whitespace-nowrap"
              title="Abrir enlace de consulta en share.gemini.google"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Gemini Share</span>
            </a>

            <button
              onClick={() => setActiveTab('LIBRO_DIARIO')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'LIBRO_DIARIO'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              title="Ver Libro Diario y Partida Doble"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Diario</span>
            </button>

            <button
              onClick={onOpenMasterclass}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Cátedra Docente</span>
              <span className="sm:hidden">Guía</span>
            </button>

            <button
              onClick={onPrintReport}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Imprimir / Exportar Informe Completo"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onResetCase}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Restablecer Caso Práctico Inicial"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Status of accounting equation & mobile navigation */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Mobile nav overflow */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 w-full">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Equation summary */}
          <div className="flex items-center gap-2 text-slate-600">
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700">Ecuación Patrimonial:</span>
            <span className="font-mono tabular-nums">
              Activo: <strong className="text-slate-900">{formatCurrency(totalAssets)}</strong>
            </span>
            <span>=</span>
            <span className="font-mono tabular-nums">
              Pasivo + Patrimonio: <strong className="text-slate-900">{formatCurrency(totalLiabilitiesAndEquity)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isBalanced ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cuadre Contable Perfecto (Partida Doble Verificada)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Descuadre temporal en ajuste</span>
              </span>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Marco: <strong className="text-slate-700">NIIF para las PYMES (Grupo 2)</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
