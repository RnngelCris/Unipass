import React, { useEffect, useState } from 'react';
import { getStatsSalidas, getSalidasAlumnos } from '../../services/SalidasService';
import { useAuth } from '../../context/AuthContext';
import { DoorClosed, CheckCircle2, XCircle, ListChecks, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import emptyBox from '../../assets/images/empty-box.png';

const COLORS = ['#FDE68A', '#BBF7D0', '#FCA5A5'];

const InicioPreceptor: React.FC = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    Pendientes: 0,
    Aprobadas: 0,
    Rechazadas: 0,
    Total: 0
  });
  const [salidas, setSalidas] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSalidas, setLoadingSalidas] = useState(true);

  const data = userData?.Data || userData?.data;
  const empleado = data?.employee?.[0];
  const esCoordinacion = empleado?.ID_DEPARATAMENTO === 351;

  useEffect(() => {
    const matriculaPreceptor = empleado?.MATRICULA;
    if (!matriculaPreceptor) return;
    const fetchStats = async () => {
      try {
        const statsData = await getStatsSalidas(String(matriculaPreceptor));
        setStats({
          Pendientes: statsData.Pendientes || 0,
          Aprobadas: statsData.Aprobadas || 0,
          Rechazadas: statsData.Rechazadas || 0,
          Total: statsData.Total || 0
        });
      } catch (error) {
        console.error('Error al obtener estadísticas de salidas:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    const fetchSalidas = async () => {
      try {
        const salidasData = await getSalidasAlumnos(String(matriculaPreceptor));
        setSalidas(Array.isArray(salidasData) ? [...salidasData] : []);
      } catch (error) {
        console.error('Error al obtener salidas de alumnos:', error);
        setSalidas([]);
      } finally {
        setLoadingSalidas(false);
      }
    };
    setLoadingStats(true);
    setLoadingSalidas(true);
    fetchStats();
    fetchSalidas();
  }, [empleado]);

  const cards = [
    {
      label: 'Salidas Pendientes',
      value: stats.Pendientes,
      icon: <ListChecks className="h-8 w-8 text-yellow-500" />, 
      bg: 'bg-yellow-100',
      text: 'text-yellow-800'
    },
    {
      label: 'Salidas Aprobadas',
      value: stats.Aprobadas,
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />, 
      bg: 'bg-green-100',
      text: 'text-green-800'
    },
    {
      label: 'Salidas Rechazadas',
      value: stats.Rechazadas,
      icon: <XCircle className="h-8 w-8 text-red-500" />, 
      bg: 'bg-red-100',
      text: 'text-red-800'
    },
    {
      label: 'Totales',
      value: stats.Total,
      icon: <DoorClosed className="h-8 w-8 text-blue-500" />, 
      bg: 'bg-blue-100',
      text: 'text-blue-800'
    }
  ];

  // Datos para el gráfico de pastel
  const pieData = [
    { name: 'Pendientes', value: stats.Pendientes },
    { name: 'Aprobadas', value: stats.Aprobadas },
    { name: 'Rechazadas', value: stats.Rechazadas },
  ];

  // Procesamiento de datos reales para los gráficos de barras y líneas
  // 1. Agrupar salidas por mes y estado
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const salidasPorMes: Record<string, { Pendientes: number; Aprobadas: number; Rechazadas: number }> = {};

  salidas.forEach((salida) => {
    const fecha = new Date(salida.FechaSalida);
    const mes = meses[fecha.getMonth()];
    if (!salidasPorMes[mes]) {
      salidasPorMes[mes] = { Pendientes: 0, Aprobadas: 0, Rechazadas: 0 };
    }
    const estado = salida.StatusPermission?.toLowerCase();
    if (estado === 'pendiente') salidasPorMes[mes].Pendientes += 1;
    else if (estado === 'aprobada') salidasPorMes[mes].Aprobadas += 1;
    else salidasPorMes[mes].Rechazadas += 1;
  });

  // 2. Generar arrays para los gráficos
  const mesesConDatos = Object.keys(salidasPorMes);
  const barData = mesesConDatos.map((mes) => ({
    name: mes,
    ...salidasPorMes[mes],
  }));
  const lineData = mesesConDatos.map((mes) => ({
    name: mes,
    Aprobadas: salidasPorMes[mes].Aprobadas,
    Rechazadas: salidasPorMes[mes].Rechazadas,
  }));

  // Últimas salidas (ordenadas por fecha descendente)
  const ultimasSalidas = [...salidas]
    .sort((a, b) => new Date(b.FechaSalida).getTime() - new Date(a.FechaSalida).getTime())
    .slice(0, 5);

  const hayDatos = salidas && salidas.length > 0;

  const loading = loadingStats || loadingSalidas;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 bg-white dark:bg-gray-900">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <span className="text-lg text-gray-500 dark:text-gray-400 font-medium">Cargando...</span>
        </div>
      ) : !hayDatos ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <img src={emptyBox} alt="Sin datos" className="w-40 h-40 mb-6 opacity-80" />
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No hay datos a mostrar</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            {esCoordinacion ? 'Bienvenido al Panel de Coordinador' : 'Bienvenido al Panel de Preceptor'}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Columna de tarjetas */}
            <div className="flex flex-col space-y-4 col-span-1 h-full">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-lg p-4 flex flex-col items-center shadow-lg border border-gray-200 dark:border-gray-600 dark:shadow-[0_4px_24px_#00000040] ${card.bg} dark:bg-gray-800/80 h-28 justify-center transition-colors duration-200`}
                >
                  <div className="mb-2">{card.icon}</div>
                  <span className={`text-base font-medium mb-1 ${card.text} dark:text-white`}>{card.label}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</span>
                </div>
              ))}
              {/* Tabla de últimas salidas debajo de las tarjetas */}
              <div className="mt-8 bg-white dark:bg-gray-900/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Últimas Salidas Registradas</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/80 text-base bg-white dark:bg-gray-900/80">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-700/60">Estudiante</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-700/60">Estado</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-700/60">Fecha de salida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60 bg-white dark:bg-gray-900/80">
                      {ultimasSalidas.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No hay salidas recientes.</td>
                        </tr>
                      ) : (
                        ultimasSalidas.map((salida, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{salida.Nombre}</td>
                            <td className="px-4 py-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                salida.StatusPermission?.toLowerCase() === 'pendiente'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : salida.StatusPermission?.toLowerCase() === 'aprobada'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {salida.StatusPermission?.charAt(0).toUpperCase() + salida.StatusPermission?.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-500 dark:text-gray-300">{new Date(salida.FechaSalida).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Columna de gráficos y tabla */}
            <div className="col-span-2 flex flex-col space-y-8 h-full">
              <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex-1 flex flex-col justify-center transition-colors duration-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Distribución de Salidas</h2>
                {pieData.every(d => d.value === 0) ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 dark:text-gray-500">
                    <span>Sin datos para graficar</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={[...pieData]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex-1 flex flex-col justify-center transition-colors duration-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Histórico de Salidas</h2>
                {barData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 dark:text-gray-500">
                    <span>Sin datos para graficar</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[...barData]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Pendientes" fill="#FDE68A" />
                      <Bar dataKey="Aprobadas" fill="#BBF7D0" />
                      <Bar dataKey="Rechazadas" fill="#FCA5A5" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Gráfico de líneas adicional */}
              <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex-1 flex flex-col justify-center transition-colors duration-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Evolución de Salidas Aprobadas y Rechazadas</h2>
                {lineData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 dark:text-gray-500">
                    <span>Sin datos para graficar</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={[...lineData]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Aprobadas" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Rechazadas" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InicioPreceptor; 