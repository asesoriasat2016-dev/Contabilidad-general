import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Download, 
  FileSpreadsheet, 
  Scale, 
  Info,
  ShieldCheck,
  Building
} from 'lucide-react';
import { CompanyProfile, LegalStep, LegalSocietyType } from '../types/accounting';
import { formatCurrency } from '../utils/accountingCalculations';

interface LegalizationModuleProps {
  company: CompanyProfile;
  setCompany: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  onAdvanceToOpening: () => void;
}

export const LegalizationModule: React.FC<LegalizationModuleProps> = ({
  company,
  setCompany,
  onAdvanceToOpening
}) => {
  const [selectedStep, setSelectedStep] = useState<LegalStep>(company.legalSteps[0]);
  const [showBylawsModal, setShowBylawsModal] = useState<boolean>(false);

  const toggleStep = (id: string) => {
    setCompany(prev => ({
      ...prev,
      legalSteps: prev.legalSteps.map(step => 
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    }));
  };

  const handleProfileChange = (field: keyof CompanyProfile, value: string | number) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const completedCount = company.legalSteps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / company.legalSteps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              01. Creación, Constitución y Legalización Empresarial
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Fase jurídica y tributaria previa a la operación comercial. Comprende la elección de la forma societaria, trámite de homonimia, firma de estatutos, expedición del NIT y habilitación de libros mercantiles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBylawsModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Ver Minuta de Estatutos
            </button>
            <button
              onClick={onAdvanceToOpening}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>Continuar al Balance de Apertura</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Legal Progress Bar */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span className="font-medium">
            Progreso de Formalización: {completedCount} de {company.legalSteps.length} etapas cumplidas
          </span>
          <span className="font-mono tabular-nums font-semibold text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid: Company Identification & Legal Step Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Formulario de Identificación Societaria */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Ficha Técnica de la Persona Jurídica
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Razón Social / Denominación Comercial
                </label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NIT con Dígito de Verificación
                  </label>
                  <input
                    type="text"
                    value={company.nit}
                    onChange={(e) => handleProfileChange('nit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tipo Societario
                  </label>
                  <select
                    value={company.legalType}
                    onChange={(e) => handleProfileChange('legalType', e.target.value as LegalSocietyType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs bg-white"
                  >
                    <option value="SAS">S.A.S. (Sociedad por Acciones Simplificada)</option>
                    <option value="LTDA">Ltda. (Sociedad de Responsabilidad Limitada)</option>
                    <option value="SA">S.A. (Sociedad Anónima)</option>
                    <option value="EU">E.U. (Empresa Unipersonal)</option>
                    <option value="PERSONA_NATURAL">Persona Natural con Establecimiento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Código Actividad Económica (CIIU)
                  </label>
                  <input
                    type="text"
                    value={company.economicActivityCode}
                    onChange={(e) => handleProfileChange('economicActivityCode', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Régimen Tributario DIAN
                  </label>
                  <select
                    value={company.taxRegime}
                    onChange={(e) => handleProfileChange('taxRegime', e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs bg-white"
                  >
                    <option value="Responsable de IVA">Responsable de IVA (Común)</option>
                    <option value="No Responsable">No Responsable de IVA</option>
                    <option value="Régimen Simple de Tributación">Régimen Simple (RST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Descripción del Objeto Social
                </label>
                <textarea
                  rows={2}
                  value={company.activityDescription}
                  onChange={(e) => handleProfileChange('activityDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800 block mb-2">Composición del Capital Social</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Autorizado</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 text-xs">
                      {formatCurrency(company.capitalAuthorized)}
                    </span>
                  </div>
                  <div className="bg-indigo-50/50 p-2.5 rounded border border-indigo-100">
                    <span className="text-[11px] text-indigo-600 block">Suscrito</span>
                    <span className="font-mono tabular-nums font-semibold text-indigo-900 text-xs">
                      {formatCurrency(company.capitalSubscribed)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-100">
                    <span className="text-[11px] text-emerald-600 block">Pagado</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-900 text-xs">
                      {formatCurrency(company.capitalPaid)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[11px]">Representante Legal</label>
                  <p className="font-medium text-slate-800">{company.legalRepresentative}</p>
                  <span className="text-slate-400 font-mono text-[10px]">{company.idRepresentative}</span>
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px]">Revisor Fiscal</label>
                  <p className="font-medium text-slate-800">{company.fiscalAuditor || 'No requerido'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Docente Masterclass Box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-indigo-950">
                <h3 className="font-bold text-indigo-900 text-sm">
                  Cátedra del Docente: La Sociedad por Acciones Simplificada (S.A.S.)
                </h3>
                <p className="leading-relaxed text-indigo-900/90">
                  Creada por la <strong>Ley 1258 de 2008</strong>, la S.A.S. revolucionó el derecho societario colombiano y latinoamericano. Su principal virtud contable y patrimonial es la <strong>estricta separación entre el patrimonio de los socios y el patrimonio de la persona jurídica</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 pt-1 text-indigo-900/90">
                  <li><strong>Aportes:</strong> Los accionistas solo responden hasta el monto de sus aportes suscritos.</li>
                  <li><strong>Flexibilidad:</strong> Permite constituirse por documento privado sin escritura pública notarial (salvo que se aporten bienes inmuebles sujetos a registro).</li>
                  <li><strong>Capital:</strong> Concede hasta 2 años para pagar el capital suscrito (a diferencia del Código de Comercio que exigía el 100% de contado en Ltda.).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matriz de Pasos Legales y Detalle Didáctico */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Ruta Secuencial de Legalización y Formalización
                </h2>
                <p className="text-xs text-slate-500">
                  Haz clic en cada etapa para inspeccionar el fundamento normativo y marcar su cumplimiento.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">8 Etapas</span>
            </div>

            <div className="space-y-2.5">
              {company.legalSteps.map((step) => {
                const isSelected = selectedStep.id === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStep(step.id);
                          }}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400">Paso 0{step.number}</span>
                            <span className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-700'}`}>
                              {step.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Entidad: <strong>{step.entity}</strong>
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        step.completed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {step.completed ? 'Formalizado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Step Detail Box */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  Detalle del Paso 0{selectedStep.number}: {selectedStep.title}
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedStep.lawReference}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {selectedStep.description}
              </p>
              {selectedStep.notes && (
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 block text-[11px]">Evidencia / Anotación de Cumplimiento:</span>
                  <p className="text-slate-600 font-mono text-[11px] mt-0.5">{selectedStep.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Viewer: Estatutos Sociales */}
      {showBylawsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Minuta del Documento Privado de Constitución y Estatutos
                </h3>
              </div>
              <button
                onClick={() => setShowBylawsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif text-slate-800 leading-relaxed">
              <div className="text-center pb-4 border-b border-slate-200">
                <h4 className="font-bold text-base text-slate-900 tracking-wide uppercase">
                  ESTATUTOS DE CONSTITUCIÓN DE SOCIEDAD POR ACCIONES SIMPLIFICADA
                </h4>
                <p className="text-slate-500 font-sans text-xs mt-1">
                  "{company.name}" · DOMICILIO: {company.city}
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans uppercase text-[11px]">CAPÍTULO I. NOMBRE, NACIONALIDAD, DOMICILIO Y DURACIÓN</strong>
                <p className="mt-1">
                  <strong>ARTÍCULO 1. Razón Social:</strong> La sociedad se denominará <em>"{company.name}"</em>, regida bajo la Ley 1258 de 2008 y las normas del Código de Comercio colombiano.
                </p>
                <p className="mt-1">
                  <strong>ARTÍCULO 2. Domicilio:</strong> El domicilio principal será {company.city}, pudiendo establecer sucursales o agencias en el territorio nacional o en el exterior.
                </p>
                <p className="mt-1">
                  <strong>ARTÍCULO 3. Duración:</strong> El término de duración de la sociedad será indefinido.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans uppercase text-[11px]">CAPÍTULO II. OBJETO SOCIAL</strong>
                <p className="mt-1">
                  <strong>ARTÍCULO 4. Actividad Económica:</strong> {company.activityDescription}, así como la realización de cualquier acto lícito de comercio contemplado en la legislación comercial.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans uppercase text-[11px]">CAPÍTULO III. CAPITAL SOCIAL Y ACCIONES</strong>
                <p className="mt-1">
                  <strong>ARTÍCULO 5. Capital Autorizado:</strong> El capital autorizado es de {formatCurrency(company.capitalAuthorized)}, dividido en 15.000 acciones ordinarias de valor nominal $10.000 moneda corriente cada una.
                </p>
                <p className="mt-1">
                  <strong>ARTÍCULO 6. Capital Suscrito y Pagado:</strong> En este acto fundacional los accionistas suscriben y pagan en dinero y especie la suma de {formatCurrency(company.capitalPaid)}, representado en 10.000 acciones íntegramente liberadas.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans uppercase text-[11px]">CAPÍTULO IV. ÓRGANOS DE GOBIERNO Y REPRESENTACIÓN</strong>
                <p className="mt-1">
                  <strong>ARTÍCULO 7. Asamblea General de Accionistas:</strong> Máximo órgano societario encargado de aprobar balances, reformas estatutarias y distribución de dividendos.
                </p>
                <p className="mt-1">
                  <strong>ARTÍCULO 8. Representación Legal:</strong> La administración y representación estará a cargo de un Representante Legal ({company.legalRepresentative}).
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Documento apto para radicación en Cámara de Comercio con firmas reconocidas
              </span>
              <button
                onClick={() => setShowBylawsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
