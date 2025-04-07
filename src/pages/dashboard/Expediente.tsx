import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search, User, GraduationCap, MapPin, Mail, Phone, Calendar,
  BookOpen, Clock, AlertTriangle, DoorClosed, MessageSquare, Bell,
  ArrowUpRight, ArrowDownRight, Filter, Eye, Download, Trash2,
  ChevronDown, ChevronUp, BarChart3, Activity, Users, FileText,
  CalendarDays, AlertCircle, Plus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DashboardProps } from '../../types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const tabs = [
  { id: 'overview', label: 'Vista General', icon: BarChart3 },
  { id: 'exits', label: 'Salidas', icon: DoorClosed },
  { id: 'delays', label: 'Retardos', icon: Clock },
  { id: 'notes', label: 'Notas', icon: MessageSquare }
];

type StatusType = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
type BehaviorNoteType = 'positive' | 'negative';

interface BehaviorNote {
  id: number;
  type: BehaviorNoteType;
  content: string;
  author: string;
  date: string;
  time: string;
}

interface Student {
  id: string;
  name: string;
  dormitory: string;
  email: string;
  phone: string;
  room: string;
  career: string;
  semester: string;
  startDate: string;
  status: 'active' | 'inactive';
  stats: {
    salidas: number;
    retardos: number;
    permisos: number;
    advertencias: number;
  };
  warnings: Array<{
    id: number;
    type: 'warning' | 'info' | 'danger';
    message: string;
    date: string;
  }>;
  attendance: {
    onTime: number;
    late: number;
    absent: number;
  };
  recentActivity: Array<{
    id: number;
    type: 'exit' | 'return' | 'warning' | 'permission';
    description: string;
    date: string;
    status?: 'pending' | 'approved' | 'rejected';
  }>;
  exitHistory: Array<{
    month: string;
    count: number;
  }>;
  lateHistory: Array<{
    month: string;
    count: number;
  }>;
  behaviorNotes: BehaviorNote[];
}

const studentsDB: Student[] = [
  {
    id: '2024001',
    name: 'Juan Pérez González',
    dormitory: 'Dormitorio Varones',
    email: 'juan.perez@ulv.edu.mx',
    phone: '(555) 123-4567',
    room: 'Habitación 203',
    career: 'Ingeniería en Sistemas',
    semester: '2do Semestre',
    startDate: '2024-01-15',
    status: 'active',
    stats: {
      salidas: 12,
      retardos: 3,
      permisos: 5,
      advertencias: 2
    },
    warnings: [
      {
        id: 1,
        type: 'warning',
        message: 'Llegada tarde al dormitorio',
        date: '2024-03-15'
      },
      {
        id: 2,
        type: 'danger',
        message: 'Ruido excesivo después de hora límite',
        date: '2024-03-10'
      }
    ],
    attendance: {
      onTime: 85,
      late: 10,
      absent: 5
    },
    recentActivity: [
      {
        id: 1,
        type: 'exit',
        description: 'Salida al pueblo',
        date: '2024-03-15 14:30',
        status: 'approved'
      },
      {
        id: 2,
        type: 'warning',
        description: 'Llegada tarde al dormitorio',
        date: '2024-03-14 22:30'
      },
      {
        id: 3,
        type: 'permission',
        description: 'Solicitud de permiso para evento familiar',
        date: '2024-03-13 09:15',
        status: 'pending'
      }
    ],
    exitHistory: [
      { month: 'Enero', count: 8 },
      { month: 'Febrero', count: 10 },
      { month: 'Marzo', count: 12 }
    ],
    lateHistory: [
      { month: 'Enero', count: 1 },
      { month: 'Febrero', count: 2 },
      { month: 'Marzo', count: 3 }
    ],
    behaviorNotes: [
      {
        id: 1,
        type: 'positive',
        content: 'Participó activamente en la limpieza del dormitorio',
        author: 'Preceptor García',
        date: '2024-03-15',
        time: '14:30'
      },
      {
        id: 2,
        type: 'negative',
        content: 'Llegó tarde al dormitorio después del toque de queda',
        author: 'Preceptora Martínez',
        date: '2024-03-14',
        time: '22:15'
      }
    ]
  },
  {
    id: '2024002',
    name: 'María López Sánchez',
    dormitory: 'Dormitorio Mujeres',
    email: 'maria.lopez@ulv.edu.mx',
    phone: '(555) 123-4568',
    room: 'Habitación 105',
    career: 'Administración de Empresas',
    semester: '4to Semestre',
    startDate: '2024-01-15',
    status: 'active',
    stats: {
      salidas: 8,
      retardos: 1,
      permisos: 3,
      advertencias: 0
    },
    warnings: [],
    attendance: {
      onTime: 95,
      late: 5,
      absent: 0
    },
    recentActivity: [
      {
        id: 1,
        type: 'exit',
        description: 'Salida a casa',
        date: '2024-03-16 09:00',
        status: 'approved'
      },
      {
        id: 2,
        type: 'return',
        description: 'Retorno de salida',
        date: '2024-03-15 18:30'
      }
    ],
    exitHistory: [
      { month: 'Enero', count: 6 },
      { month: 'Febrero', count: 7 },
      { month: 'Marzo', count: 8 }
    ],
    lateHistory: [
      { month: 'Enero', count: 0 },
      { month: 'Febrero', count: 1 },
      { month: 'Marzo', count: 0 }
    ],
    behaviorNotes: []
  }
];

const Expediente: React.FC<DashboardProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({
    type: 'positive',
    content: '',
  });

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = studentsDB.filter(student => 
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setShowResults(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM, yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exit':
        return <DoorClosed className="h-5 w-5 text-blue-500" />;
      case 'return':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'permission':
        return <CalendarDays className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: StatusType) => {
    const styles: Record<StatusType, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return styles[status];
  };

  const handleAddNote = () => {
    if (!selectedStudent || !newNote.content.trim()) return;

    const note: BehaviorNote = {
      id: selectedStudent.behaviorNotes.length + 1,
      type: newNote.type as BehaviorNoteType,
      content: newNote.content,
      author: 'Preceptor Actual',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm')
    };

    setSelectedStudent({
      ...selectedStudent,
      behaviorNotes: [note, ...selectedStudent.behaviorNotes]
    });

    setNewNote({
      type: 'positive',
      content: ''
    });
    setShowNoteModal(false);
  };

  const renderExitsTab = (student: Student) => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Historial de Salidas</h3>
        <div className="space-y-4">
          {student.recentActivity
            .filter(activity => activity.type === 'exit')
            .map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                  <DoorClosed className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.date)}
                    </span>
                    {activity.status && (
                      <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadge(activity.status as StatusType)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderDelaysTab = (student: Student) => {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: 'rgb(209, 213, 219)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.15)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: 'rgb(209, 213, 219)'
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
          backgroundColor: '#1F2937'
        },
        line: {
          borderWidth: 2.5
        }
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Historial de Retardos</h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-b dark:from-gray-900/50 dark:to-gray-900/0 z-10 pointer-events-none" />
            <Line
              data={{
                labels: student.lateHistory.map(item => item.month),
                datasets: [
                  {
                    label: 'Retardos',
                    data: student.lateHistory.map(item => item.count),
                    borderColor: '#F87171',
                    backgroundColor: 'rgba(248, 113, 113, 0.2)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointBackgroundColor: '#F87171',
                    pointBorderColor: '#F87171',
                    pointHoverBackgroundColor: '#FCA5A5',
                    pointHoverBorderColor: '#FCA5A5'
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderNotesTab = (student: Student) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Notas de Comportamiento</h3>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Agregar nota</span>
          </button>
        </div>

        <div className="space-y-4">
          {student.behaviorNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg ${
                note.type === 'positive'
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-red-50 border-l-4 border-red-500'
              }`}
            >
              <p className={note.type === 'positive' ? 'text-green-800' : 'text-red-800'}>
                {note.content}
              </p>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-600">{note.author}</span>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{formatDate(note.date)}</span>
                  <span>{note.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOverviewTab = (student: Student) => {
    const exitData = {
      labels: student.exitHistory.map(item => item.month),
      datasets: [
        {
          label: 'Salidas',
          data: student.exitHistory.map(item => item.count),
          borderColor: '#60A5FA',
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: '#60A5FA',
          pointBorderColor: '#60A5FA',
          pointHoverBackgroundColor: '#93C5FD',
          pointHoverBorderColor: '#93C5FD'
        }
      ]
    };

    const lateData = {
      labels: student.lateHistory.map(item => item.month),
      datasets: [
        {
          label: 'Retardos',
          data: student.lateHistory.map(item => item.count),
          borderColor: '#F87171',
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: '#F87171',
          pointBorderColor: '#F87171',
          pointHoverBackgroundColor: '#FCA5A5',
          pointHoverBorderColor: '#FCA5A5'
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: 'rgb(209, 213, 219)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.15)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: 'rgb(209, 213, 219)'
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
          backgroundColor: '#1F2937'
        },
        line: {
          borderWidth: 2.5
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <DoorClosed className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Salidas</span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400">+2</span>
            </div>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{student.stats.salidas}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Retardos</span>
              </div>
              <span className="text-sm text-yellow-600 dark:text-yellow-400">+1</span>
            </div>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{student.stats.retardos}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permisos</span>
              </div>
              <span className="text-sm text-purple-600 dark:text-purple-400">+3</span>
            </div>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{student.stats.permisos}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Advertencias</span>
              </div>
              <span className="text-sm text-red-600 dark:text-red-400">+1</span>
            </div>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{student.stats.advertencias}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tendencia de Salidas</h3>
            <div className="h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-b dark:from-gray-900/50 dark:to-gray-900/0 z-10 pointer-events-none" />
              <Line data={exitData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tendencia de Retardos</h3>
            <div className="h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-b dark:from-gray-900/50 dark:to-gray-900/0 z-10 pointer-events-none" />
              <Line data={lateData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actividad Reciente</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {(showAllActivity ? student.recentActivity : student.recentActivity.slice(0, 3)).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                      {activity.status && (
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadge(activity.status as StatusType)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {student.recentActivity.length > 3 && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="w-full mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {showAllActivity ? 'Ver menos' : 'Ver más actividad'}
              </button>
            )}
          </div>
        </div>

        {/* Warnings */}
        {student.warnings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advertencias Activas</h3>
            </div>
            <div className="p-4 space-y-4">
              {student.warnings.map((warning) => (
                <div
                  key={warning.id}
                  className={`p-4 rounded-lg ${
                    warning.type === 'danger' 
                      ? 'bg-red-50 dark:bg-red-900/30' 
                      : 'bg-yellow-50 dark:bg-yellow-900/30'
                  }`}
                >
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                      warning.type === 'danger' 
                        ? 'text-red-500 dark:text-red-400' 
                        : 'text-yellow-500 dark:text-yellow-400'
                    }`} />
                    <div>
                      <p className={warning.type === 'danger' 
                        ? 'text-red-800 dark:text-red-300' 
                        : 'text-yellow-800 dark:text-yellow-300'}>
                        {warning.message}
                      </p>
                      <p className={`text-sm mt-1 ${
                        warning.type === 'danger' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {formatDate(warning.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!selectedStudent ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 dark:bg-yellow-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-gray-800 dark:text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Expedientes Estudiantiles</h1>
              <p className="text-gray-600 dark:text-gray-400">Gestión y seguimiento de estudiantes</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por matrícula o nombre del estudiante..."
                className="w-full pl-10 pr-4 py-3 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="bg-yellow-400 dark:bg-yellow-500 rounded-full p-2">
                        <User className="h-5 w-5 text-gray-800 dark:text-gray-900" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {student.id}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {student.dormitory}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setSearchQuery('');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                ← Volver
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-400 dark:bg-yellow-500 rounded-full p-2">
                  <User className="h-6 w-6 text-gray-800 dark:text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {selectedStudent.id}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedStudent.dormitory}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedStudent.status as StatusType)}`}>
                      {selectedStudent.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="border-b dark:border-gray-700">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-900'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && renderOverviewTab(selectedStudent)}
              {activeTab === 'exits' && renderExitsTab(selectedStudent)}
              {activeTab === 'delays' && renderDelaysTab(selectedStudent)}
              {activeTab === 'notes' && renderNotesTab(selectedStudent)}
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agregar Nota de Comportamiento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de nota
                </label>
                <select
                  className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value as BehaviorNoteType })}
                >
                  <option value="positive">Positiva</option>
                  <option value="negative">Negativa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido
                </label>
                <textarea
                  className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Describe el comportamiento del estudiante..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-900 rounded-lg hover:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expediente;