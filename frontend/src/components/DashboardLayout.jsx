import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  Bars3Icon, XMarkIcon, HomeIcon, UserGroupIcon, AcademicCapIcon,
  BookOpenIcon, ClipboardDocumentListIcon, DocumentTextIcon,
  ClipboardDocumentCheckIcon, MegaphoneIcon, CurrencyDollarIcon,
  UserIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon,
  ChevronDownIcon, ChatBubbleLeftRightIcon, BellIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('darkMode', newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out successfully'); };

  const isActive = (path) => location.pathname === path;

  const getMenuItems = () => {
    const commonItems = [
      { icon: ChatBubbleLeftRightIcon, label: 'Messages', path: '/messages' },
      { icon: MegaphoneIcon, label: 'Notices', path: '/notices' },
      { icon: UserIcon, label: 'Profile', path: '/profile' }
    ];
    if (user?.role === 'admin') {
      return [
        { icon: HomeIcon, label: 'Dashboard', path: '/admin' },
        { icon: UserGroupIcon, label: 'Students', path: '/students' },
        { icon: AcademicCapIcon, label: 'Teachers', path: '/teachers' },
        { icon: BookOpenIcon, label: 'Classes', path: '/classes' },
        { icon: ClipboardDocumentListIcon, label: 'Subjects', path: '/subjects' },
        { icon: ClipboardDocumentCheckIcon, label: 'Attendance', path: '/attendance' },
        { icon: CurrencyDollarIcon, label: 'Fees', path: '/fees' },
        { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
        { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
        ...commonItems
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { icon: HomeIcon, label: 'Dashboard', path: '/teacher' },
        { icon: BookOpenIcon, label: 'Classes', path: '/classes' },
        { icon: ClipboardDocumentListIcon, label: 'Subjects', path: '/subjects' },
        { icon: ClipboardDocumentCheckIcon, label: 'Attendance', path: '/attendance' },
        { icon: CurrencyDollarIcon, label: 'Fees', path: '/fees' },
        { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
        { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
        ...commonItems
      ];
    }
    return [
      { icon: HomeIcon, label: 'Dashboard', path: '/student' },
      { icon: DocumentTextIcon, label: 'Exams', path: '/exams' },
      { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
      ...commonItems
    ];
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-100 dark:border-surface-700/50">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
          S
        </div>
        <div>
          <h2 className="text-base font-bold text-surface-900 dark:text-white leading-tight tracking-tight">School CMS</h2>
          <p className="text-[10px] text-surface-400 dark:text-surface-500 font-medium uppercase tracking-wider">Management System</p>
        </div>
      </div>

      <nav className="mt-4 px-3 space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-5 rounded-full bg-primary-500 dark:bg-primary-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-surface-100 dark:border-surface-700/50 mt-auto">
        <button onClick={handleLogout}
          className="sidebar-link text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-72 max-w-[85vw] transform transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative flex w-full flex-col bg-white dark:bg-surface-800 shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-4 btn-ghost p-1.5 rounded-xl">
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:flex lg:flex-col lg:border-r lg:border-surface-200/80 lg:bg-white dark:lg:bg-surface-800/90 dark:lg:border-surface-700/50 lg:shadow-sm">
        <SidebarContent />
      </div>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-x-4 border-b border-surface-200/80 dark:border-surface-700/50 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-surface-500 dark:text-surface-400 lg:hidden hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors">
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-x-3">
            {/* Dark mode toggle */}
            <button onClick={toggleDarkMode}
              className="btn-ghost p-2 rounded-xl relative"
              title={darkMode ? 'Light mode' : 'Dark mode'}>
              <div className="relative">
                <SunIcon className={`h-5 w-5 transition-all duration-300 ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50 absolute'}`} />
                <MoonIcon className={`h-5 w-5 transition-all duration-300 ${darkMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} />
              </div>
            </button>

            {/* Notification bell */}
            <button className="btn-ghost p-2 rounded-xl relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-surface-800" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all border border-transparent hover:border-surface-200 dark:hover:border-surface-600">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-surface-400 dark:text-surface-500 capitalize font-medium">{user?.role}</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-surface-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700/50 py-2 animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors font-medium">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </button>
                  <button onClick={() => { navigate('/notices'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors font-medium">
                    <MegaphoneIcon className="h-4 w-4" />
                    Notices
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
