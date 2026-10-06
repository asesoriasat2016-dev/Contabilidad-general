import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Percent, 
  FileSpreadsheet, 
  BookOpenCheck,
  Plus,
  HelpCircle,
  FileCheck2,
  Briefcase
} from 'lucide-react';
import { Employee, PayrollRowCalculation } from '../types/accounting';
import { calculateEmployeePayroll, formatCurrency, formatNumber } from '../utils/accountingCalculations';
import { CONSTANTS } from '../data/initialData';

interface PayrollModuleProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onAdvanceToAdjustments: () => void;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({
  employees,
  setEmployees,
  onAdvanceToAdjustments
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'DESPRENDIBLE' | 'CARGA_PATRONAL' | 'PRESTACIONES' | 'ASIENTO'>('DESPRENDIBLE');
  const [showAddEmpModal, setShowAddEmpModal] = useState<boolean>(false);

  const [newEmp, setNewEmp] = useState<Employee>({
    id: `emp-${Date.now()}`,
    document: 'C.C. 1.098.334.221',
    fullName: 'Laura Sofía Castro',
    position: 'Analista de Marketing y Clientes',
    baseSalary: 1800000,
    daysWorked: 30,
    dayOvertimeHours: 2,
    nightOvertimeHours: 0,
    sundayHolidayHours: 0,
    appliesTransportAllowance: true,
    riskLevelArl: 1,
    otherDeductions: 0
  });

  const payrollCalculations: PayrollRowCalculation[] = employees.map(emp => calculateEmployeePayroll(emp));

  // Consolidated sums
  const totalDevengadoAll = payrollCalculations.reduce((s, r) => s + r.totalDevengado, 0);
  const totalDeductionsWorkerAll = payrollCalculations.reduce((s, r) => s + r.totalDeductionsWorker, 0);
  const totalNetPayableAll = payrollCalculations.reduce((s, r) => s + r.netPayableWorker, 0);

  const totalHealthEmployerAll = payrollCalculations.reduce((s, r) => s + r.healthEmployer, 0);
  const totalPensionEmployerAll = payrollCalculations.reduce((s, r) => s + r.pensionEmployer, 0);
  const totalArlEmployerAll = payrollCalculations.reduce((s, r) => s + r.arlEmployer, 0);
  const totalSocialSecurityEmployerAll = totalHealthEmployerAll + totalPensionEmployerAll + totalArlEmployerAll;

  const totalParafiscalesAll = payrollCalculations.reduce((s, r) => s + r.sena + r.icbf + r.cajaCompensacion, 0);

  const totalCesantiasAll = payrollCalculations.reduce((s, r) => s + r.cesantias, 0);
  const totalInteresesAll = payrollCalculations.reduce((s, r) => s + r.interesesCesantias, 0);
  const totalPrimaAll = payrollCalculations.reduce((s, r) => s + r.primaServicios, 0);
  const totalVacacionesAll = payrollCalculations.reduce((s, r) => s + r.vacaciones, 0);
  const totalPrestacionesAll = totalCesantiasAll + totalInteresesAll + totalPrimaAll + totalVacacionesAll;

  const totalCostCompanyAll = payrollCalculations.reduce((s, r) => s + r.totalEmployerCost, 0);

  const handleUpdateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployees(prev => [...prev, { ...newEmp, id: `emp-${Date.now()}` }]);
    setShowAddEmpModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              06. Módulo de Nómina Legal, Seguridad Social y Cargas Patronales
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Liquidación integral del gasto laboral bajo el <strong>Código Sustantivo del Trabajo (CST)</strong> y <strong>NIC 19 / NIIF para las PYMES Sección 28 (Beneficios a Empleados)</strong>. Integra salarios devengados, aportes a la seguridad social, parafiscales y provisión mensual de prestaciones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Añadir Empleado</span>
            </button>
            <button
              onClick={onAdvanceToAdjustments}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Continuar a Asientos de Ajuste</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: The 4 Dimensions of Labor Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">1. Salarios Devengados (Bruto)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalDevengadoAll)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Neto a pagar: <strong className="text-slate-800">{formatCurrency(totalNetPayableAll)}</strong>
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">2. Seguridad Social Patronal</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {formatCurrency(totalSocialSecurityEmployerAll)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Salud (8.5%) + Pensión (12%) + ARL
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">3. Provisiones Prestacionales</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {formatCurrency(totalPrestacionesAll)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Cesantías (8.33%), Prima, Vacaciones
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-lg text-white shadow-xs">
          <span className="text-xs font-medium text-slate-400">COSTO TOTAL EMPRESA (MES)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {formatCurrency(totalCostCompanyAll)}
          </div>
          <span className="text-[11px] text-indigo-300 font-mono mt-1 inline-block">
            Gasto Cuentas 5105 / 5205
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          onClick={() => setSelectedSubTab('DESPRENDIBLE')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            selectedSubTab === 'DESPRENDIBLE'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          A. Liquidación Empleados (Devengos & Deducciones)
        </button>
        <button
          onClick={() => setSelectedSubTab('CARGA_PATRONAL')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            selectedSubTab === 'CARGA_PATRONAL'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          B. Seguridad Social & Parafiscales Patronales
        </button>
        <button
          onClick={() => setSelectedSubTab('PRESTACIONES')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            selectedSubTab === 'PRESTACIONES'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          C. Provisiones Prestaciones Sociales (Pasivo 2610)
        </button>
        <button
          onClick={() => setSelectedSubTab('ASIENTO')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            selectedSubTab === 'ASIENTO'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          D. Asiento Contable Consolidado
        </button>
      </div>

      {/* Subtab 1: Devengos y Deducciones Trabajador */}
      {selectedSubTab === 'DESPRENDIBLE' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Desprendible Mensual de Sueldos y Salarios por Empleado
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Tope Aux. Transporte: {formatCurrency(CONSTANTS.SMMLV * 2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Colaborador / Cargo</th>
                  <th className="py-2.5 px-3 text-right">Salario Base</th>
                  <th className="py-2.5 px-2 text-center">Días</th>
                  <th className="py-2.5 px-2 text-right">H.E. Diurnas</th>
                  <th className="py-2.5 px-3 text-right">Aux. Transporte</th>
                  <th className="py-2.5 px-3 text-right text-slate-900 font-bold">Total Devengado</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">Salud 4%</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">Pensión 4%</th>
                  <th className="py-2.5 px-3 text-right text-indigo-700 font-bold">Neto a Pagar (2505)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payrollCalculations.map((row) => (
                  <tr key={row.employee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900">{row.employee.fullName}</div>
                      <span className="text-[10px] text-slate-500">{row.employee.position}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      <input
                        type="number"
                        value={row.employee.baseSalary}
                        onChange={(e) => handleUpdateEmployee(row.employee.id, 'baseSalary', Number(e.target.value))}
                        className="w-24 text-right px-1.5 py-0.5 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-3 px-2 text-center text-slate-700">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={row.employee.daysWorked}
                        onChange={(e) => handleUpdateEmployee(row.employee.id, 'daysWorked', Number(e.target.value))}
                        className="w-12 text-center px-1 py-0.5 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-3 px-2 text-right text-slate-700">
                      <input
                        type="number"
                        min={0}
                        value={row.employee.dayOvertimeHours}
                        onChange={(e) => handleUpdateEmployee(row.employee.id, 'dayOvertimeHours', Number(e.target.value))}
                        className="w-12 text-right px-1 py-0.5 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.transportAllowancePay)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(row.totalDevengado)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700">
                      {formatCurrency(row.healthWorker)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700">
                      {formatCurrency(row.pensionWorker)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700 text-xs">
                      {formatCurrency(row.netPayableWorker)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <td colSpan={5} className="py-2.5 px-3 font-sans text-slate-900">TOTALES NÓMINA EMPLEADOS</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900">{formatCurrency(totalDevengadoAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                    {formatCurrency(payrollCalculations.reduce((s, r) => s + r.healthWorker, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                    {formatCurrency(payrollCalculations.reduce((s, r) => s + r.pensionWorker, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-700 text-sm">
                    {formatCurrency(totalNetPayableAll)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Carga Patronal (Seguridad Social & Parafiscales) */}
      {selectedSubTab === 'CARGA_PATRONAL' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Aportes a la Seguridad Social Patronal y Parafiscales (Obligaciones Empleador)
            </h2>
            <p className="text-xs text-slate-500">
              Liquidado sobre el Ingreso Base de Cotización (IBC salarial, sin auxilio de transporte).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Empleado</th>
                  <th className="py-2.5 px-3 text-right">Base IBC</th>
                  <th className="py-2.5 px-3 text-right">Salud Patronal (8.5%)</th>
                  <th className="py-2.5 px-3 text-right">Pensión Patronal (12%)</th>
                  <th className="py-2.5 px-3 text-right">ARL Patronal</th>
                  <th className="py-2.5 px-3 text-right">Caja Comp. (4%)</th>
                  <th className="py-2.5 px-3 text-right">ICBF (3%)</th>
                  <th className="py-2.5 px-3 text-right">SENA (2%)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Total Patronal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payrollCalculations.map((row) => (
                  <tr key={row.employee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">
                      {row.employee.fullName}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.salarialBase)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.healthEmployer)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.pensionEmployer)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.arlEmployer)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.cajaCompensacion)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.icbf)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatCurrency(row.sena)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(
                        row.healthEmployer + row.pensionEmployer + row.arlEmployer + 
                        row.cajaCompensacion + row.icbf + row.sena
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">TOTALES APORTES PATRONALES</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalHealthEmployerAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalPensionEmployerAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalArlEmployerAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(payrollCalculations.reduce((s, r) => s + r.cajaCompensacion, 0))}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(payrollCalculations.reduce((s, r) => s + r.icbf, 0))}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(payrollCalculations.reduce((s, r) => s + r.sena, 0))}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-700 text-sm">
                    {formatCurrency(totalSocialSecurityEmployerAll + totalParafiscalesAll)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Prestaciones Sociales */}
      {selectedSubTab === 'PRESTACIONES' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Causación Mensual de Prestaciones Sociales (Pasivo Estimado 2610)
            </h2>
            <p className="text-xs text-slate-500">
              Provisión técnica mensual para garantizar los fondos de liquidación definitiva del trabajador.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Empleado</th>
                  <th className="py-2.5 px-3 text-right">Base Prestacional</th>
                  <th className="py-2.5 px-3 text-right">Cesantías (8.33%)</th>
                  <th className="py-2.5 px-3 text-right">Intereses Ces. (1%)</th>
                  <th className="py-2.5 px-3 text-right">Prima Serv. (8.33%)</th>
                  <th className="py-2.5 px-3 text-right">Vacaciones (4.16%)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Total Provisión Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {payrollCalculations.map((row) => (
                  <tr key={row.employee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">{row.employee.fullName}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(row.totalDevengado)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(row.cesantias)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(row.interesesCesantias)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(row.primaServicios)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(row.vacaciones)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {formatCurrency(row.cesantias + row.interesesCesantias + row.primaServicios + row.vacaciones)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">TOTALES PROVISIÓN PRESTACIONES</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalCesantiasAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalInteresesAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalPrimaAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(totalVacacionesAll)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                    {formatCurrency(totalPrestacionesAll)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Asiento Contable Consolidado */}
      {selectedSubTab === 'ASIENTO' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Comprobante de Diario: Causación Integral de Nómina Mensual
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">Corte: 31/03/2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-sans">
                  <th className="py-2 px-3 text-left">Código PUC</th>
                  <th className="py-2 px-3 text-left">Cuenta Contable</th>
                  <th className="py-2 px-3 text-right">Débito (Gasto)</th>
                  <th className="py-2 px-3 text-right">Crédito (Pasivo / Obligación)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">510506</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Gasto Sueldos, Horas Extras y Auxilio Transporte</td>
                  <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalDevengadoAll)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">510568</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Gasto Seguridad Social Patronal (Salud, Pensión, ARL)</td>
                  <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalSocialSecurityEmployerAll)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">510570</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Gasto Parafiscales (Caja de Compensación, SENA, ICBF)</td>
                  <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalParafiscalesAll)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">510530</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Gasto Prestaciones Sociales (Cesantías, Intereses, Prima, Vacaciones)</td>
                  <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(totalPrestacionesAll)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                </tr>

                {/* Créditos Pasivos */}
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">250505</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Salarios por Pagar (Nómina Neta a Empleados)</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-indigo-700 font-bold">{formatCurrency(totalNetPayableAll)}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">237005</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Aportes a Salud EPS por Pagar (4% trabajador + 8.5% patronal)</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {formatCurrency(totalHealthEmployerAll + payrollCalculations.reduce((s, r) => s + r.healthWorker, 0))}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">238030</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Aportes a Pensión AFP por Pagar (4% trabajador + 12% patronal)</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {formatCurrency(totalPensionEmployerAll + payrollCalculations.reduce((s, r) => s + r.pensionWorker, 0))}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">237006</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Aportes ARL por Pagar</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(totalArlEmployerAll)}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">237010</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Aportes Parafiscales por Pagar (Caja, SENA, ICBF)</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(totalParafiscalesAll)}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">261005</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Provisión Cesantías e Intereses sobre Cesantías</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(totalCesantiasAll + totalInteresesAll)}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">261020</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Provisión Prima de Servicios Semestral</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(totalPrimaAll)}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-semibold text-slate-700">261015</td>
                  <td className="py-2 px-3 font-sans text-slate-800">Provisión Vacaciones Anuales</td>
                  <td className="py-2 px-3 text-right text-slate-400">$0</td>
                  <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(totalVacacionesAll)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">SUMAS IGUALES DE NÓMINA (CUADRE PERFECTO)</td>
                  <td className="py-2.5 px-3 text-right text-slate-900">{formatCurrency(totalCostCompanyAll)}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-700">{formatCurrency(totalCostCompanyAll)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Docente Callout */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-5 text-xs text-indigo-950 space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <BookOpenCheck className="w-4 h-4 text-indigo-700" />
          <span>Cátedra del Docente: La Carga Prestacional Real de un Trabajador en Colombia</span>
        </div>
        <p className="leading-relaxed text-indigo-900/90">
          Un error habitual de los emprendedores y gerentes principiantes es creer que contratar a un empleado con un salario de $2.000.000 solo le cuesta a la empresa esos dos millones.
        </p>
        <p className="leading-relaxed text-indigo-900/90">
          Al sumar la <strong>Seguridad Social Patronal (~21%)</strong>, los <strong>Parafiscales (9%)</strong> y las <strong>Prestaciones Sociales (~21.83%)</strong>, el factor prestacional real asciende a aproximadamente un <strong>52% adicional</strong> sobre el salario base. Por cada $100 de salario, la empresa debe presupuestar aproximadamente $152 de costo operacional total.
        </p>
      </div>

      {/* Modal: Añadir Empleado */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Vincular Nuevo Colaborador a la Empresa
            </h3>
            <form onSubmit={handleAddEmployeeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newEmp.fullName}
                  onChange={(e) => setNewEmp({ ...newEmp, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Documento de Identidad</label>
                  <input
                    type="text"
                    required
                    value={newEmp.document}
                    onChange={(e) => setNewEmp({ ...newEmp, document: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    required
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Salario Básico Mensual ($)</label>
                  <input
                    type="number"
                    required
                    min={CONSTANTS.SMMLV}
                    value={newEmp.baseSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nivel Riesgo ARL</label>
                  <select
                    value={newEmp.riskLevelArl}
                    onChange={(e) => setNewEmp({ ...newEmp, riskLevelArl: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value={1}>Riesgo I (Oficinas - 0.522%)</option>
                    <option value={2}>Riesgo II (Comercio - 1.044%)</option>
                    <option value={3}>Riesgo III (Manufactura - 2.436%)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Registrar en Nómina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
