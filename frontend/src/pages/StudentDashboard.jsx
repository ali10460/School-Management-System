import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, DocumentTextIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { assignmentService, examService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, examRes] = await Promise.all([
          assignmentService.getAssignments(), examService.getExams()
        ]);
        setAssignments(assignRes.data.assignments || []);
        setExams(examRes.data.exams || []);
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

  const activeAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date());
  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date());

  const statCards = [
    { title: 'Active Assignments', value: activeAssignments.length, icon: DocumentTextIcon, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Upcoming Exams', value: upcomingExams.length, icon: AcademicCapIcon, gradient: 'from-emerald-500 to-emerald-600' },
    { title: 'Completed Tasks', value: assignments.length - activeAssignments.length, icon: ClipboardDocumentCheckIcon, gradient: 'from-violet-500 to-violet-600' }
  ];

  const quickActions = [
    { label: 'View Exams', icon: AcademicCapIcon, path: '/exams', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'View Assignments', icon: DocumentTextIcon, path: '/assignments', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'My Profile', icon: UserIcon, path: '/profile', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' }
  ];

  const maxCount = Math.max(activeAssignments.length, upcomingExams.length, assignments.length - activeAssignments.length, 1);

  if (loading) return <DashboardLayout><LoadingSpinner size="lg" className="min-h-[60vh]" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 sm:p-8 mb-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-primary-100 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user?.name}</h1>
            <p className="text-primary-200 mt-1">Track your assignments and exams</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium capitalize border border-white/10">{user?.role}</span>
            <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm border border-white/10">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 stagger-children">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-3.5 rounded-xl shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className={`bg-gradient-to-r ${stat.gradient} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${(stat.value / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className={`${action.bg} ${action.color} p-4 rounded-xl text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
              <action.icon className="h-7 w-7 mb-2" />
              <p className="font-semibold text-sm">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Assignments</h2>
            {activeAssignments.length > 0 && <span className="badge-blue">{activeAssignments.length} pending</span>}
          </div>
          {activeAssignments.length > 0 ? (
            <div className="space-y-3">
              {activeAssignments.slice(0, 5).map((assign, i) => {
                const dueDate = new Date(assign.dueDate);
                const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                return (
                  <div key={assign._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        <DocumentTextIcon className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{assign.title}</p>
                        <p className="text-xs text-gray-500 truncate">{assign.subject?.name || 'No subject'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-semibold ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
                        {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                      </p>
                      <p className="text-xs text-gray-400">{dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 font-medium">No active assignments</p>
              <p className="text-xs text-gray-400 mt-1">Great job! You're all caught up.</p>
            </div>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Exams</h2>
            {upcomingExams.length > 0 && <span className="badge-green">{upcomingExams.length} upcoming</span>}
          </div>
          {upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {upcomingExams.slice(0, 5).map((exam, i) => {
                const examDate = new Date(exam.date);
                const daysUntil = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={exam._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                        <AcademicCapIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{exam.name}</p>
                        <p className="text-xs text-gray-500 truncate">{exam.subject?.name} · {exam.class?.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-emerald-600">
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </p>
                      <p className="text-xs text-gray-400">{exam.totalMarks} marks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AcademicCapIcon className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 font-medium">No upcoming exams</p>
              <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
