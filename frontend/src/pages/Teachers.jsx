import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { teacherService, subjectService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { TableSkeleton } from '../components/LoadingSpinner';
import useFormValidation, { validators } from '../hooks/useFormValidation';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', subjects: [],
    qualification: '', salary: '', experience: '', department: '', designation: ''
  });
  const [search, setSearch] = useState('');

  const rules = useMemo(() => ({
    name: [validators.required('Name is required')],
    email: [validators.required('Email is required'), validators.email()],
    ...(!editData ? { password: [validators.required('Password is required'), validators.minLength(6, 'Password must be at least 6 characters')] } : {}),
    salary: [validators.numeric('Salary must be a valid number')]
  }), [editData]);

  const { getFieldError, validateField, validateForm, touchField, clearErrors } = useFormValidation(rules);

  useEffect(() => { fetchTeachers(); fetchSubjects(); }, [search]);

  const fetchTeachers = async () => {
    try { const res = await teacherService.getTeachers({ search }); setTeachers(res.data.teachers); }
    catch { toast.error('Failed to fetch teachers'); } finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try { const res = await subjectService.getSubjects(); setSubjects(res.data.subjects); } catch {}
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (name, value) => {
    touchField(name);
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    try {
      if (editData) { await teacherService.updateTeacher(editData._id, formData); toast.success('Teacher updated'); }
      else { await teacherService.createTeacher(formData); toast.success('Teacher created'); }
      setShowModal(false); fetchTeachers(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (teacher) => {
    setEditData(teacher);
    setFormData({
      name: teacher.user?.name || '', email: teacher.user?.email || '', phone: teacher.user?.phone || '',
      subjects: teacher.subjects?.map(s => s._id) || [], qualification: teacher.qualification || '',
      salary: teacher.salary || '', experience: teacher.experience || '',
      department: teacher.department || '', designation: teacher.designation || '', password: ''
    });
    clearErrors();
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await teacherService.deleteTeacher(id); toast.success('Deleted'); fetchTeachers(); } catch { toast.error('Failed'); }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({ name: '', email: '', phone: '', password: '', subjects: [], qualification: '', salary: '', experience: '', department: '', designation: '' });
    clearErrors();
  };

  const fieldConfig = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'number' },
    { name: 'qualification', label: 'Qualification', type: 'text' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'experience', label: 'Experience', type: 'text' },
    { name: 'salary', label: 'Salary', type: 'number' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Teachers</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage all teachers</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Add Teacher
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Subjects</th>
              <th className="table-header">Qualification</th>
              <th className="table-header text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {loading ? <TableSkeleton rows={5} cols={6} />
              : teachers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={AcademicCapIcon} title="No teachers found" description="Try a different search or add a new teacher" /></td></tr>
              ) : teachers.map((teacher, i) => (
                <tr key={teacher._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="table-cell font-medium">{teacher.user?.name}</td>
                  <td className="table-cell text-surface-500">{teacher.user?.email}</td>
                  <td className="table-cell text-surface-500">{teacher.user?.phone || '-'}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.slice(0, 2).map(s => <span key={s._id} className="badge-blue">{s.name}</span>)}
                      {teacher.subjects?.length > 2 && <span className="badge-gray">+{teacher.subjects.length - 2}</span>}
                    </div>
                  </td>
                  <td className="table-cell">{teacher.qualification || '-'}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(teacher)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(teacher._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Teacher' : 'Add Teacher'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfig.map(field => (
              <FormField key={field.name} label={field.label} error={getFieldError(field.name)} required={field.required}>
                <input
                  type={field.type}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={(e) => handleBlur(field.name, e.target.value)}
                  className={`input-field ${getFieldError(field.name) ? 'error' : ''}`}
                  {...(field.type === 'number' ? { min: "0" } : {})}
                />
              </FormField>
            ))}
            <div className="md:col-span-2">
              <FormField label="Subjects">
                <select multiple value={formData.subjects} onChange={(e) => handleChange('subjects', Array.from(e.target.selectedOptions, o => o.value))} className="input-field h-32">
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} {s.classAssigned?.name ? `- ${s.classAssigned.name}` : ''}</option>)}
                </select>
              </FormField>
            </div>
            {!editData && (
              <div className="md:col-span-2">
                <FormField label="Password" error={getFieldError('password')} required hint="Minimum 6 characters">
                  <input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={(e) => handleBlur('password', e.target.value)} className={`input-field ${getFieldError('password') ? 'error' : ''}`} />
                </FormField>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Teachers;
