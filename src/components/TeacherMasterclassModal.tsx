import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Layers, 
  Lightbulb, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingCalculations';

interface TeacherMasterclassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherMasterclassModal: React.FC<TeacherMasterclassModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'MAPA' | 'PARTIDA_DOBLE' | 'GLOSARIO' | 'QUIZ'>('MAPA');

  // Interactive Double Entry Playground state
  const [testAccountType, setTestAccountType] = useState<'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'GASTO' | 'COSTO'>('ACTIVO');
  const [testAction, setTestAction] = useState<'AUMENTA' | 'DISMINUYE'>('AUMENTA');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  if (!isOpen) return null;

  // Pedagogical Double Entry Logic Explainer
  const getDoubleEntryRule = () => {
    switch (testAccountType) {
      case 'ACTIVO':
        return testAction === 'AUMENTA'
          ? { side: 'DÉBITO (DEBE)', reason: 'Los activos representan bienes y derechos controlados por la entidad. Todo recurso que ingresa o se adquiere suma valor a la empresa, por lo cual se anota en el Debe (+ Activo).' }
          : { side: 'CRÉDITO (HABER)', reason: 'Cuando un activo sale, se vende, se cobra o se consume (ej. salida de dinero de bancos o venta de inventarios), disminuye su valor y se anota en el Haber (- Activo).' };
      case 'PASIVO':
        return testAction === 'AUMENTA'
          ? { side: 'CRÉDITO (HABER)', reason: 'Los pasivos representan deudas u obligaciones con terceros. Al contraer una nueva deuda o adquirir mercancía a crédito, la obligación aumenta acreditándola (+ Pasivo).' }
          : { side: 'DÉBITO (DEBE)', reason: 'Cuando la empresa paga o extingue una deuda (ej. abona a proveedores o cancela nómina), la obligación disminuye y se debita (- Pasivo).' };
      case 'PATRIMONIO':
        return testAction === 'AUMENTA'
          ? { side: 'CRÉDITO (HABER)', reason: 'El patrimonio es la parte residual de los activos una vez deducidos los pasivos. Los aportes de socios y las utilidades generadas aumentan el patrimonio acreditándolo (+ Patrimonio).' }
          : { side: 'DÉBITO (DEBE)', reason: 'La distribución de dividendos o pérdidas del ejercicio reducen el patrimonio, por lo que se debitan (- Patrimonio).' };
      case 'INGRESO':
        return testAction === 'AUMENTA'
          ? { side: 'CRÉDITO (HABER)', reason: 'Los ingresos representan beneficios económicos que incrementan el patrimonio. Por su naturaleza acreedora, se reconocen siempre en el Haber (+ Ingreso).' }
          : { side: 'DÉBITO (DEBE)', reason: 'Las cancelaciones, devoluciones en ventas o el cierre de cuentas al final del año se debitan para dejar el saldo en cero (- Ingreso).' };
      case 'GASTO':
        return testAction === 'AUMENTA'
          ? { side: 'DÉBITO (DEBE)', reason: 'Los gastos son decrementos en beneficios económicos que reducen el patrimonio. Al incurrir en sueldos, arriendos o servicios públicos, se debitan (+ Gasto).' }
          : { side: 'CRÉDITO (HABER)', reason: 'En el asiento de cierre de fin de periodo o corrección, los gastos se acreditan contra pérdidas y ganancias para dejarlos en cero.' };
      case 'COSTO':
        return testAction === 'AUMENTA'
          ? { side: 'DÉBITO (DEBE)', reason: 'Los costos corresponden a erogaciones directamente vinculadas a la adquisición o producción de los bienes vendidos (Kardex). Se debitan al reconocer la salida de mercancía (+ Costo).' }
          : { side: 'CRÉDITO (HABER)', reason: 'Al cierre del ejercicio, se acreditan para cancelarse contra la cuenta de Pérdidas y Ganancias.' };
    }
  };

  const quizQuestions = [
    {
      id: 1,
      question: 'Bajo la NIC 2 / NIIF para PYMES Sección 13, ¿cuál de las siguientes fórmulas de valuación de inventarios está expresamente PROHIBIDA?',
      options: ['Promedio Ponderado', 'PEPS (Primeras en Entrar, Primeras en Salir)', 'UEPS (Últimas en Entrar, Primeras en Salir)', 'Identificación Específica'],
      correct: 2,
      explanation: 'El método UEPS (LIFO) está prohibido en las NIIF porque en economías con inflación deja los inventarios subvaluados en el balance y reduce artificialmente la utilidad contable.'
    },
    {
      id: 2,
      question: 'En el Balance de Apertura de una S.A.S., un socio aporta $40 millones en efectivo a la cuenta de ahorros empresarial. ¿Cuál es el asiento contable correcto?',
      options: [
        'Débito a Bancos (1110) $40M y Crédito a Ingresos Operacionales (4135) $40M',
        'Débito a Bancos (1110) $40M y Crédito a Capital Suscrito y Pagado (3105) $40M',
        'Débito a Capital Social (3105) $40M y Crédito a Bancos (1110) $40M',
        'Débito a Proveedores (2205) $40M y Crédito a Caja (1105) $40M'
      ],
      correct: 1,
      explanation: 'El aporte fundacional aumenta el activo en Bancos (Débito) y constituye el patrimonio inicial de los socios en Capital Suscrito y Pagado (Crédito).'
    },
    {
      id: 3,
      question: '¿Cuál es la principal diferencia entre el deterioro de cartera bajo NIIF 9 y la provisión fiscal tradicional?',
      options: [
        'NIIF 9 utiliza el modelo de pérdida incurrida (esperar a que ocurra la mora)',
        'NIIF 9 utiliza el modelo prospectivo de Pérdida Crediticia Esperada (PCE) desde el reconocimiento inicial',
        'La provisión fiscal solo se calcula sobre ventas de contado',
        'En NIIF 9 la provisión se acredita directamente en bancos'
      ],
      correct: 1,
      explanation: 'NIIF 9 exige estimar la probabilidad estadística de impago desde el día 1 en que se otorga el crédito a clientes, a diferencia del criterio fiscal que exige mora demostrada.'
    },
    {
      id: 4,
      question: '¿Por qué la depreciación contable (NIC 16) no representa una salida de efectivo en el Estado de Flujos de Efectivo?',
      options: [
        'Porque es un pago realizado en moneda extranjera',
        'Porque es la distribución sistemática del costo de un bien a lo largo de su vida útil, no un desembolso bancario en el periodo',
        'Porque los activos nunca pierden valor',
        'Porque la ley prohíbe pagar la depreciación con cheque'
      ],
      correct: 1,
      explanation: 'La depreciación es un gasto virtual de imputación contable para reflejar el desgaste. Por esta razón, en el flujo de efectivo por el método indirecto se vuelve a sumar a la utilidad neta.'
    }
  ];

  const handleSelectQuiz = (qId: number, optIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const calculatedScore = quizQuestions.reduce((score, q) => {
    return quizAnswers[q.id] === q.correct ? score + 1 : score;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-800 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Cátedra Docente: Guía Maestra de Contabilidad & Finanzas
              </h2>
              <p className="text-xs text-indigo-200">
                Fundamentos conceptuales, dinámica de la partida doble y autoevaluación pedagógica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-300 hover:text-white text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Modal Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 space-x-2 text-xs">
          <button
            onClick={() => setActiveSection('MAPA')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeSection === 'MAPA'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Ciclo Contable de 7 Etapas
          </button>
          <button
            onClick={() => setActiveSection('PARTIDA_DOBLE')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeSection === 'PARTIDA_DOBLE'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Laboratorio de Partida Doble
          </button>
          <button
            onClick={() => setActiveSection('GLOSARIO')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeSection === 'GLOSARIO'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Glosario Técnico NIIF
          </button>
          <button
            onClick={() => setActiveSection('QUIZ')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeSection === 'QUIZ'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Autoevaluación Práctica
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* SECTION 1: MAPA DEL CICLO CONTABLE */}
          {activeSection === 'MAPA' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                <h3 className="font-bold text-indigo-950 text-sm mb-1">
                  El Ciclo Contable Integral Explicado por el Docente
                </h3>
                <p className="text-indigo-900/90 leading-relaxed">
                  Todo profesional de las ciencias económicas debe comprender que la contabilidad no es un archivo estático, sino un <strong>sistema vivo de información</strong> que transforma los hechos comerciales cotidianos en decisiones estratégicas de alta dirección.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-mono text-indigo-700 font-bold block text-[11px]">ETAPA 01 Y 02</span>
                  <h4 className="font-bold text-slate-900 text-xs">Constitución Legal y Balance de Apertura</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Nacimiento jurídico de la entidad (S.A.S., estatutos, RUT ante la DIAN) y registro fundacional de los aportes de capital. Se comprueba que el total de bienes iniciales sea igual al capital suscrito.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-mono text-indigo-700 font-bold block text-[11px]">ETAPA 03</span>
                  <h4 className="font-bold text-slate-900 text-xs">Gestión de Inventarios y Kardex (NIC 2)</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Control permanente de compras y ventas de mercancía. El Kardex calcula en cada salida el Costo de Ventas (Cuenta 6135), descargando la bodega a costo promedio ponderado.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-mono text-indigo-700 font-bold block text-[11px]">ETAPA 04 Y 05</span>
                  <h4 className="font-bold text-slate-900 text-xs">Cartera Comercial, Deterioro y Provisiones (NIIF 9 / NIC 37)</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Monitoreo de derechos de cobro, estratificación por morosidad y reconocimiento de pérdidas crediticias esperadas (PCE) para no inflar los activos financieros de la empresa.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-mono text-indigo-700 font-bold block text-[11px]">ETAPA 06</span>
                  <h4 className="font-bold text-slate-900 text-xs">Nómina Legal y Seguridad Social (NIC 19)</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Liquidación de sueldos devengados, retenciones de salud y pensión a trabajadores, aportes patronales, parafiscales y provisión mensual de cesantías, prima y vacaciones.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 md:col-span-2">
                  <span className="font-mono text-indigo-700 font-bold block text-[11px]">ETAPA 07 Y 08</span>
                  <h4 className="font-bold text-slate-900 text-xs">Ajustes de Periodo y Emisión de Estados Financieros con Notas NIIF</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Causación de depreciaciones (NIC 16) y seguros diferidos. Elaboración del Estado de Situación Financiera clasificado, Estado de Resultados Integrales, Flujos de Efectivo y el cuerpo de Notas Explicativas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LABORATORIO DE PARTIDA DOBLE */}
          {activeSection === 'PARTIDA_DOBLE' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Simulador Interactivo de Partida Doble: ¿Debe o Haber?
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Selecciona la clase de cuenta contable y el sentido de la transacción para ver en qué columna se anota y la justificación teórica emitida por el docente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Clase de Cuenta Contable</label>
                    <select
                      value={testAccountType}
                      onChange={(e) => setTestAccountType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-medium"
                    >
                      <option value="ACTIVO">Activo (Clase 1: Bienes y Derechos)</option>
                      <option value="PASIVO">Pasivo (Clase 2: Obligaciones y Deudas)</option>
                      <option value="PATRIMONIO">Patrimonio (Clase 3: Capital y Reservas)</option>
                      <option value="INGRESO">Ingresos (Clase 4: Ventas y Rendimientos)</option>
                      <option value="GASTO">Gastos (Clase 5: Operacionales y Administración)</option>
                      <option value="COSTO">Costos (Clase 6: Costo de Ventas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Efecto de la Operación</label>
                    <select
                      value={testAction}
                      onChange={(e) => setTestAction(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-medium"
                    >
                      <option value="AUMENTA">Aumenta (Incrementa su saldo)</option>
                      <option value="DISMINUYE">Disminuye (Reduce su saldo o se extingue)</option>
                    </select>
                  </div>
                </div>

                {/* Didactic Verdict Result Box */}
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-900 font-semibold">
                      Veredicto Contable:
                    </span>
                    <span className="px-3 py-1 rounded bg-indigo-600 text-white font-mono font-bold text-xs tracking-wide">
                      {getDoubleEntryRule().side}
                    </span>
                  </div>
                  <p className="text-indigo-950 font-medium leading-relaxed pt-1">
                    {getDoubleEntryRule().reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: GLOSARIO TÉCNICO NIIF */}
          {activeSection === 'GLOSARIO' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">NIIF / IFRS</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Normas Internacionales de Información Financiera emitidas por el IASB, cuyo propósito es estandarizar la información contable a nivel global con base en la realidad económica sobre la forma jurídica.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">Pérdida Crediticia Esperada (PCE)</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Modelo de deterioro de la NIIF 9 donde la entidad calcula el valor presente ponderado por probabilidad del déficit de efectivo esperado a lo largo de la vida del activo financiero.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">Valor Neto Realizable (VNR)</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Precio estimado de venta de un activo en el curso normal de la operación menos los costos estimados para terminar su producción y llevar a cabo la venta (NIC 2).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">Principio de Devengo / Causación</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Postulado contable que estipula que los efectos de las transacciones se reconocen cuando ocurren (cuando nace el derecho o la obligación), y no cuando se cobra o paga el dinero.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">EBITDA</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Beneficio antes de Intereses, Impuestos, Depreciaciones y Amortizaciones. Muestra la capacidad operativa pura de la empresa de generar flujo de caja.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-indigo-700 block text-xs">IBC (Ingreso Base de Cotización)</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Porción salarial devengada por el trabajador sobre la cual se aplican los porcentajes legales de aportes a salud, pensión, riesgos laborales y parafiscales (excluye el auxilio de transporte).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: AUTOEVALUACIÓN DIDÁCTICA */}
          {activeSection === 'QUIZ' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Evaluación Formativa de Conceptos Contables
                  </h3>
                  <p className="text-xs text-slate-500">
                    Responde las 4 preguntas para validar tu comprensión antes del cierre.
                  </p>
                </div>
                {showQuizResults && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Calificación:</span>
                    <span className="font-mono text-base font-bold text-indigo-700">
                      {calculatedScore} / {quizQuestions.length} ({Math.round((calculatedScore / quizQuestions.length) * 100)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <span className="font-semibold text-slate-900 block text-xs">
                      {idx + 1}. {q.question}
                    </span>

                    <div className="space-y-2 pl-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[q.id] === optIdx;
                        const isCorrect = q.correct === optIdx;

                        let style = 'border-slate-200 hover:bg-slate-50';
                        if (showQuizResults) {
                          if (isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          else if (isSelected && !isCorrect) style = 'border-rose-500 bg-rose-50 text-rose-950';
                        } else if (isSelected) {
                          style = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => !showQuizResults && handleSelectQuiz(q.id, optIdx)}
                            className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${style}`}
                          >
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="p-3 bg-slate-100 rounded text-[11px] text-slate-700 mt-2">
                        <strong>Explicación del Docente:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                {!showQuizResults ? (
                  <button
                    onClick={() => setShowQuizResults(true)}
                    className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
                  >
                    Calificar Respuestas
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowQuizResults(false);
                      setQuizAnswers({});
                    }}
                    className="px-5 py-2 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-700"
                  >
                    Reiniciar Test
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Módulo Pedagógico Docente Universitario · Facultad de Ciencias Económicas y Contables
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-md hover:bg-slate-800"
          >
            Volver a la Herramienta
          </button>
        </div>
      </div>
    </div>
  );
};
