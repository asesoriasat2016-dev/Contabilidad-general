import React, { useState, useMemo } from 'react';
import { 
  CompanyProfile,
  OpeningPartnerContribution,
  InventoryItem,
  KardexEntry,
  ClientReceivable,
  ContingentProvision,
  Employee,
  AdjustmentItem,
  ActiveTab
} from './types/accounting';
import { 
  INITIAL_COMPANY,
  INITIAL_PARTNERS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_KARDEX,
  INITIAL_RECEIVABLES,
  INITIAL_CONTINGENCIES,
  INITIAL_EMPLOYEES,
  INITIAL_ADJUSTMENTS
} from './data/initialData';
import { 
  calculateEmployeePayroll, 
  calculateReceivablesAging, 
  buildMasterJournalEntries, 
  computeTrialBalance, 
  generateFinancialStatements 
} from './utils/accountingCalculations';
import { Header } from './components/Header';
import { LegalizationModule } from './components/LegalizationModule';
import { OpeningBalanceModule } from './components/OpeningBalanceModule';
import { InventoryKardexModule } from './components/InventoryKardexModule';
import { PortfolioReceivablesModule } from './components/PortfolioReceivablesModule';
import { ProvisionsModule } from './components/ProvisionsModule';
import { PayrollModule } from './components/PayrollModule';
import { AdjustmentsModule } from './components/AdjustmentsModule';
import { FinancialStatementsModule } from './components/FinancialStatementsModule';
import { LedgerJournalModule } from './components/LedgerJournalModule';
import { TeacherMasterclassModal } from './components/TeacherMasterclassModal';
import { PrintReportView } from './components/PrintReportView';

export default function App() {
  // Global Educational State
  const [company, setCompany] = useState<CompanyProfile>(INITIAL_COMPANY);
  const [partners, setPartners] = useState<OpeningPartnerContribution[]>(INITIAL_PARTNERS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [kardex, setKardex] = useState<KardexEntry[]>(INITIAL_KARDEX);
  const [receivables, setReceivables] = useState<ClientReceivable[]>(INITIAL_RECEIVABLES);
  const [contingencies, setContingencies] = useState<ContingentProvision[]>(INITIAL_CONTINGENCIES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>(INITIAL_ADJUSTMENTS);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('LEGAL');
  const [isMasterclassOpen, setIsMasterclassOpen] = useState<boolean>(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState<boolean>(false);

  // Real-Time Dynamic Accounting Computations
  const payrollRows = useMemo(() => {
    return employees.map(emp => calculateEmployeePayroll(emp));
  }, [employees]);

  const agingResult = useMemo(() => {
    return calculateReceivablesAging(receivables);
  }, [receivables]);

  const masterJournalEntries = useMemo(() => {
    return buildMasterJournalEntries(
      partners,
      kardex,
      receivables,
      payrollRows,
      contingencies,
      adjustments,
      agingResult.niifPceTotal
    );
  }, [partners, kardex, receivables, payrollRows, contingencies, adjustments, agingResult.niifPceTotal]);

  const trialBalance = useMemo(() => {
    return computeTrialBalance(masterJournalEntries);
  }, [masterJournalEntries]);

  const financialStatements = useMemo(() => {
    return generateFinancialStatements(company, masterJournalEntries, trialBalance);
  }, [company, masterJournalEntries, trialBalance]);

  const handleResetCase = () => {
    if (confirm('¿Deseas restablecer el caso práctico inicial a los valores de la cátedra?')) {
      setCompany(INITIAL_COMPANY);
      setPartners(INITIAL_PARTNERS);
      setInventoryItems(INITIAL_INVENTORY_ITEMS);
      setKardex(INITIAL_KARDEX);
      setReceivables(INITIAL_RECEIVABLES);
      setContingencies(INITIAL_CONTINGENCIES);
      setEmployees(INITIAL_EMPLOYEES);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setActiveTab('LEGAL');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header with Navigation Contract */}
      <Header
        company={company}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBalanced={financialStatements.balanceSheet.isBalanced}
        totalAssets={financialStatements.balanceSheet.totalAssets}
        totalLiabilitiesAndEquity={financialStatements.balanceSheet.totalLiabilitiesAndEquity}
        onOpenMasterclass={() => setIsMasterclassOpen(true)}
        onPrintReport={() => setIsPrintViewOpen(true)}
        onResetCase={handleResetCase}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'LEGAL' && (
          <LegalizationModule
            company={company}
            setCompany={setCompany}
            onAdvanceToOpening={() => setActiveTab('APERTURA')}
          />
        )}

        {activeTab === 'APERTURA' && (
          <OpeningBalanceModule
            partners={partners}
            setPartners={setPartners}
            onAdvanceToInventory={() => setActiveTab('INVENTARIOS')}
          />
        )}

        {activeTab === 'INVENTARIOS' && (
          <InventoryKardexModule
            items={inventoryItems}
            kardex={kardex}
            setKardex={setKardex}
            onAdvanceToReceivables={() => setActiveTab('CARTERA')}
          />
        )}

        {activeTab === 'CARTERA' && (
          <PortfolioReceivablesModule
            receivables={receivables}
            setReceivables={setReceivables}
            onAdvanceToProvisions={() => setActiveTab('PROVISIONES')}
          />
        )}

        {activeTab === 'PROVISIONES' && (
          <ProvisionsModule
            receivables={receivables}
            contingencies={contingencies}
            setContingencies={setContingencies}
            onAdvanceToPayroll={() => setActiveTab('NOMINA')}
          />
        )}

        {activeTab === 'NOMINA' && (
          <PayrollModule
            employees={employees}
            setEmployees={setEmployees}
            onAdvanceToAdjustments={() => setActiveTab('AJUSTES')}
          />
        )}

        {activeTab === 'AJUSTES' && (
          <AdjustmentsModule
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            onAdvanceToFinancialStatements={() => setActiveTab('ESTADOS_FINANCIEROS')}
          />
        )}

        {activeTab === 'ESTADOS_FINANCIEROS' && (
          <FinancialStatementsModule
            company={company}
            statements={financialStatements}
            trialBalanceItems={trialBalance.items}
            onPrint={() => setIsPrintViewOpen(true)}
          />
        )}

        {activeTab === 'LIBRO_DIARIO' && (
          <LedgerJournalModule
            entries={masterJournalEntries}
            trialBalanceItems={trialBalance.items}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Plataforma Didáctica de Simulación Contable y Financiera · Enfoque Pedagógico NIIF para PYMES
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMasterclassOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Consultar Cátedra del Docente
            </button>
            <span>·</span>
            <button
              onClick={() => setIsPrintViewOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              Exportar Dictamen
            </button>
          </div>
        </div>
      </footer>

      {/* Teacher Masterclass Modal */}
      <TeacherMasterclassModal
        isOpen={isMasterclassOpen}
        onClose={() => setIsMasterclassOpen(false)}
      />

      {/* Printable Report Modal */}
      {isPrintViewOpen && (
        <PrintReportView
          company={company}
          partners={partners}
          kardex={kardex}
          receivables={receivables}
          employees={employees}
          adjustments={adjustments}
          statements={financialStatements}
          onClose={() => setIsPrintViewOpen(false)}
        />
      )}
    </div>
  );
}
