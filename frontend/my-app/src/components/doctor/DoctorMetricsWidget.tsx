import React, { useState, useEffect, useCallback } from 'react';
import { useCitas } from '../../contexts/CitasContext';
import { useAuth } from '../../context/AuthContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface MetricasDoctor {
  citasSemanales: number;
  citasMensuales: number;
  pacientesUnicos: number;
  promedioCompletadas: number;
  ingresosSemana: number;
  ingresosMes: number;
}

const DoctorMetricsWidget: React.FC = () => {
  const { state: citasState } = useCitas();
  const { user } = useAuth();
  const [metricas, setMetricas] = useState<MetricasDoctor>({
    citasSemanales: 0,
    citasMensuales: 0,
    pacientesUnicos: 0,
    promedioCompletadas: 0,
    ingresosSemana: 0,
    ingresosMes: 0
  });
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');

  const calcularMetricas = useCallback(() => {
    if (!user?.id || !citasState.citas) return;

    const doctorId = Number(user.id);
    const now = new Date();
    
    // Filtrar citas del doctor
    const citasDoctor = citasState.citas.filter(cita => cita.doctorId === doctorId);
    
    // Rangos de tiempo
    const inicioSemana = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
    const finSemana = endOfWeek(now, { weekStartsOn: 1 });
    const inicioMes = startOfMonth(now);
    const finMes = endOfMonth(now);

    // Citas de la semana
    const citasSemanales = citasDoctor.filter(cita => {
      const fechaCita = new Date(cita.fechaHora);
      return isWithinInterval(fechaCita, { start: inicioSemana, end: finSemana });
    });

    // Citas del mes
    const citasMensuales = citasDoctor.filter(cita => {
      const fechaCita = new Date(cita.fechaHora);
      return isWithinInterval(fechaCita, { start: inicioMes, end: finMes });
    });

    // Pacientes únicos (del periodo seleccionado)
    const citasPeriodo = periodo === 'semana' ? citasSemanales : citasMensuales;
    const pacientesUnicos = new Set(
      citasPeriodo
        .filter(cita => cita.paciente?.id)
        .map(cita => cita.paciente!.id)
    ).size;

    // Promedio de citas completadas
    const citasCompletadas = citasPeriodo.filter(cita => cita.estado === 'completada').length;
    const promedioCompletadas = citasPeriodo.length > 0 
      ? Math.round((citasCompletadas / citasPeriodo.length) * 100) 
      : 0;

    // Ingresos estimados (precio base de $50000 por cita completada)
    const precioBaseCita = 50000;
    const ingresosSemana = citasSemanales
      .filter(cita => cita.estado === 'completada')
      .length * precioBaseCita;
    
    const ingresosMes = citasMensuales
      .filter(cita => cita.estado === 'completada')
      .length * precioBaseCita;

    setMetricas({
      citasSemanales: citasSemanales.length,
      citasMensuales: citasMensuales.length,
      pacientesUnicos,
      promedioCompletadas,
      ingresosSemana,
      ingresosMes
    });
  }, [user?.id, citasState.citas, periodo]);

  useEffect(() => {
    calcularMetricas();
  }, [calcularMetricas]);

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(cantidad);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Métricas de Rendimiento</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              periodo === 'semana'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              periodo === 'mes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Citas del periodo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">
                Citas {periodo === 'semana' ? 'Semanales' : 'Mensuales'}
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {periodo === 'semana' ? metricas.citasSemanales : metricas.citasMensuales}
              </p>
            </div>
          </div>
        </div>

        {/* Pacientes únicos */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Pacientes Únicos</p>
              <p className="text-2xl font-bold text-green-900">{metricas.pacientesUnicos}</p>
            </div>
          </div>
        </div>

        {/* Tasa de éxito */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-purple-900">{metricas.promedioCompletadas}%</p>
            </div>
          </div>
        </div>

        {/* Ingresos estimados */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">Ingresos Estimados</p>
              <p className="text-lg font-bold text-yellow-900">
                {formatearMoneda(periodo === 'semana' ? metricas.ingresosSemana : metricas.ingresosMes)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Periodo: {periodo === 'semana' ? 'Esta semana' : 'Este mes'}
          </span>
          <span>
            {format(new Date(), "dd/MM/yyyy", { locale: es })}
          </span>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Completadas vs Programadas</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metricas.promedioCompletadas}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{metricas.promedioCompletadas}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMetricsWidget;
