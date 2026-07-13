import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, AcademicCapIcon, BookOpenIcon, UserPlusIcon, ClipboardDocumentCheckIcon, DocumentTextIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { userService, classService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { PageLoading } from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, adminCount: 0 });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([userService.getStats(), classService.getClasses()]);
        setStats(statsRes.data.stats);
        setClasses(classesRes.data.classes);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    { title: 'Students', value: stats.studentCount, icon: UserGroupIcon, gradient: 'from-blue-500 to-blue-600', badge: 'badge-blue' },
    { title: 'Teachers', value: stats.teacherCount, icon: AcademicCapIcon, gradient: 'from-emerald-500 to-emerald-600', badge: 'badge-green' },
    { title: 'Classes', value: classes.length, icon: BookOpenIcon, gradient: 'from-violet-500 to-violet-600', badge: 'badge-purple' },
    { title: 'Admins', value: stats.adminCount, icon: ChartBarIcon, gradient: 'from-amber-500 to-amber-600', badge: 'badge-yellow' },
  ];

  const quickActions = [
    { label: 'Add Student', icon: UserPlusIcon, path: '/students', gradient: 'from-blue-500 to-blue-600', desc: 'Register a new student' },
    { label: 'Manage Classes', icon: BookOpenIcon, path: '/classes', gradient: 'from-emerald-500 to-emerald-600', desc: 'Organize classes & sections' },
    { label: 'Create Exam', icon: DocumentTextIcon, path: '/exams', gradient: 'from-violet-500 to-violet-600', desc: 'Schedule examinations' },
    { label: 'Attendance', icon: ClipboardDocumentCheckIcon, path: '/attendance', gradient: 'from-amber-500 to-amber-600', desc: 'Mark daily attendance' },
  ];

  const maxCount = Math.max(stats.studentCount, stats.teacherCount, classes.length, 1);

  if (loading) return <DashboardLayout><PageLoading /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-6 sm:p-8 mb-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-primary-100/80 text-sm font-semibold tracking-wide uppercase">{getGreeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">{user?.name}</h1>
            <p className="text-primary-200/80 mt-1">Here's what's happening at your school today.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium capitalize border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2 animate-pulse" />
              {user?.role}
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm border border-white/10 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-extrabold text-surface-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg shadow-black/5`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
              <div className={`bg-gradient-to-r ${stat.gradient} h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${(stat.value / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Quick Actions</h2>
              <span className="text-xs text-surface-400">Frequently used</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden p-5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/30 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-200/50 dark:hover:border-primary-700/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm mb-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-bold text-sm text-surface-900 dark:text-white mb-0.5">{action.label}</p>
                  <p className="text-xs text-surface-400">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-5">Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Students', value: stats.studentCount, icon: UserGroupIcon, color: 'bg-blue-500' },
              { label: 'Teachers', value: stats.teacherCount, icon: AcademicCapIcon, color: 'bg-emerald-500' },
              { label: 'Classes', value: classes.length, icon: BookOpenIcon, color: 'bg-violet-500' },
              { label: 'Admins', value: stats.adminCount, icon: ChartBarIcon, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-700/20 hover:bg-surface-100 dark:hover:bg-surface-700/40 transition-colors cursor-pointer group"
                onClick={() => navigate(`/${item.label.toLowerCase()}`)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color} shadow-sm`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-surface-900 dark:text-white">{item.value}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-surface-300 group-hover:text-surface-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Classes Overview</h2>
            <p className="text-xs text-surface-400 mt-0.5">All classes at a glance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-primary">{classes.length} class{classes.length !== 1 ? 'es' : ''}</span>
            <button onClick={() => navigate('/classes')} className="btn-ghost text-xs p-2">
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classes.map((cls, i) => (
              <div key={cls._id}
                className="group bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/30 rounded-xl p-4 card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm shadow-primary-500/10">
                    <BookOpenIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{cls.name}</p>
                    {cls.section && <p className="text-[11px] text-surface-400 font-medium">Section: {cls.section}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <span className={`inline-block w-2 h-2 rounded-full ${cls.classTeacher ? 'bg-emerald-400' : 'bg-surface-300'}`} />
                  <span className="truncate font-medium">{cls.classTeacher?.user?.name || 'No teacher assigned'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <BookOpenIcon className="h-8 w-8 text-surface-300 dark:text-surface-600" />
            </div>
            <p className="text-lg font-bold text-surface-900 dark:text-white">No classes yet</p>
            <p className="text-sm text-surface-400 mt-1 mb-6">Create your first class to get started</p>
            <button onClick={() => navigate('/classes')} className="btn-primary">
              <UserPlusIcon className="h-4 w-4" /> Create Class
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
