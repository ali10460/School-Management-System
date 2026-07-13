import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import useFormValidation, { validators } from '../hooks/useFormValidation';
import FormField from '../components/FormField';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'student', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const rules = useMemo(() => ({
    name: [validators.required('Name is required')],
    email: [validators.required('Email is required'), validators.email()],
    password: [validators.required('Password is required'), validators.minLength(6, 'Password must be at least 6 characters')],
    confirmPassword: [validators.required('Please confirm your password'), validators.match(formData.password, 'Passwords do not match')]
  }), [formData.password]);

  const { getFieldError, validateField, validateForm, touchField } = useFormValidation(rules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    // Re-validate confirm if password changes
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
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
      await register(formData);
      const route = formData.role === 'teacher' ? '/teacher' : '/student';
      navigate(route);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-surface-50 via-primary-50/40 to-indigo-50/30 dark:from-surface-900 dark:via-primary-950/20 dark:to-indigo-950/20">
      {/* Animated blobs */}
      <div className="auth-blob w-96 h-96 bg-primary-400 -top-20 -left-20 animate-blob" />
      <div className="auth-blob w-80 h-80 bg-purple-400 top-1/3 -right-16 animate-blob animation-delay-2000" />
      <div className="auth-blob w-72 h-72 bg-pink-400 bottom-0 left-1/3 animate-blob animation-delay-4000" />

      <div className="absolute inset-0 bg-auth-pattern opacity-30 dark:opacity-10" />

      <div className="relative w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold shadow-xl shadow-primary-500/25 mb-5 ring-4 ring-primary-500/10">
              S
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
              Join the School Management System
            </p>
          </div>

          <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField label="Full Name" error={getFieldError('name')} required>
                <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={`input-field ${getFieldError('name') ? 'error' : ''}`} placeholder="John Doe" />
              </FormField>
              <FormField label="Email Address" error={getFieldError('email')} required>
                <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`input-field ${getFieldError('email') ? 'error' : ''}`} placeholder="you@example.com" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone">
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 234 567" />
                </FormField>
                <FormField label="I am a">
                  <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Password" error={getFieldError('password')} required hint="Minimum 6 characters">
                <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={`input-field ${getFieldError('password') ? 'error' : ''}`} placeholder="Minimum 6 characters" />
              </FormField>
              <FormField label="Confirm Password" error={getFieldError('confirmPassword')} required>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={`input-field ${getFieldError('confirmPassword') ? 'error' : ''}`} placeholder="Repeat your password" />
              </FormField>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="divider mt-6">
              <span>Already registered?</span>
            </div>

            <p className="text-center mt-4">
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Sign in to your account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
