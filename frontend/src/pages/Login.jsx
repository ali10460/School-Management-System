import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import useFormValidation, { validators } from '../hooks/useFormValidation';
import FormField from '../components/FormField';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const rules = useMemo(() => ({
    email: [validators.required('Email is required'), validators.email()],
    password: [validators.required('Password is required')]
  }), []);

  const { getFieldError, validateField, validateForm, touchField, clearErrors } = useFormValidation(rules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    touchField(e.target.name);
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      const route = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
      navigate(route);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-surface-50 via-primary-50/40 to-indigo-50/30 dark:from-surface-900 dark:via-primary-950/20 dark:to-indigo-950/20">
      {/* Animated background blobs */}
      <div className="auth-blob w-96 h-96 bg-primary-400 -top-20 -left-20 animate-blob" />
      <div className="auth-blob w-80 h-80 bg-purple-400 top-1/3 -right-16 animate-blob animation-delay-2000" />
      <div className="auth-blob w-72 h-72 bg-pink-400 bottom-0 left-1/3 animate-blob animation-delay-4000" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-auth-pattern opacity-30 dark:opacity-10" />

      <div className="relative w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold shadow-xl shadow-primary-500/25 mb-5 ring-4 ring-primary-500/10">
              S
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              School Management
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField label="Email Address" error={getFieldError('email')} required>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  className={`input-field ${getFieldError('email') ? 'error' : ''}`} placeholder="you@example.com"
                />
              </FormField>
              <FormField label="Password" error={getFieldError('password')} required>
                <input
                  type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur}
                  className={`input-field ${getFieldError('password') ? 'error' : ''}`} placeholder="Enter your password"
                />
              </FormField>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-base relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="divider mt-6">
              <span>New here?</span>
            </div>

            <p className="text-center mt-4">
              <Link to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Create an account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </p>
          </div>

          <p className="text-center mt-6 text-xs text-surface-400 dark:text-surface-500">
            &copy; {new Date().getFullYear()} School Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
