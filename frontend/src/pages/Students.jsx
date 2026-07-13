import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { studentService, classService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import { PageLoading, TableSkeleton } from '../components/LoadingSpinner';
import useFormValidation, { validators } from '../hooks/useFormValidation';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', rollNumber: '', class: '', section: '',
    parentName: '', parentPhone: '', parentEmail: '', address: ''
  });
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const rules = useMemo(() => ({
    name: [validators.required('Name is required'), validators.pattern(/^[A-Za-z\s]+$/, 'Name must contain only letters')],
    email: [validators.required('Email is required'), validators.email()],
    phone: [validators.pattern(/^\d+$/, 'Phone must contain only numbers')],
    rollNumber: [validators.required('Roll number is required'), validators.pattern(/^[1-9]\d*$/, 'Roll number must be a positive number')],
    class: [validators.required('Class is required')],
    section: [validators.pattern(/^[A-Za-z0-9]+$/, 'Section must be alphanumeric')],
    parentName: [validators.pattern(/^[A-Za-z\s]+$/, 'Parent name must contain only letters')],
    parentPhone: [validators.pattern(/^\d+$/, 'Parent phone must contain only numbers')],
    parentEmail: [validators.email('Please enter a valid parent email')],
    ...(!editData ? { password: [validators.required('Password is required'), validators.minLength(6, 'Password must be at least 6 characters')] } : {})
  }), [editData]);

  const { getFieldError, validateField, validateForm, touchField, clearErrors, errors } = useFormValidation(rules);

  const isFormValid = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    const requiredFields = ['name', 'email', 'rollNumber', 'class'];
    if (!editData) requiredFields.push('password');
    return requiredFields.every(field => formData[field] && String(formData[field]).trim() !== '');
  }, [errors, formData, editData]);

  useEffect(() => { fetchStudents(); fetchClasses(); }, [search, classFilter]);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getStudents({ search, class: classFilter });
      setStudents(res.data.students);
    } catch { toast.error('Failed to fetch students'); }
    finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try { const res = await classService.getClasses(); setClasses(res.data.classes); } catch {}
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
      if (editData) { await studentService.updateStudent(editData._id, formData); toast.success('Student updated'); }
      else { await studentService.createStudent(formData); toast.success('Student created'); }
      setShowModal(false); fetchStudents(); resetForm();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (student) => {
    setEditData(student);
    setFormData({
      name: student.user?.name || '', email: student.user?.email || '', phone: student.user?.phone || '',
      rollNumber: student.rollNumber || '', class: student.class?._id || '', section: student.section || '',
      parentName: student.parentName || '', parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '', address: student.address || '', password: ''
    });
    clearErrors();
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await studentService.deleteStudent(id); toast.success('Deleted'); fetchStudents(); }
    catch { toast.error('Failed'); }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({ name: '', email: '', phone: '', password: '', rollNumber: '', class: '', section: '', parentName: '', parentPhone: '', parentEmail: '', address: '' });
    clearErrors();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Students</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage all students</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Add Student
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="input-field w-full sm:w-44">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr>
              <th className="table-header">Roll No</th>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Class</th>
              <th className="table-header">Section</th>
              <th className="table-header text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {loading ? <TableSkeleton rows={5} cols={6} />
              : students.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={UserGroupIcon} title="No students found" description="Try a different search or add a new student" /></td></tr>
              ) : students.map((student, i) => (
                <tr key={student._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="table-cell font-mono text-xs">{student.rollNumber}</td>
                  <td className="table-cell font-medium">{student.user?.name}</td>
                  <td className="table-cell text-surface-500">{student.user?.email}</td>
                  <td className="table-cell"><span className="badge-blue">{student.class?.name}</span></td>
                  <td className="table-cell">{student.section || '-'}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(student)} className="btn-ghost p-2 rounded-xl"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(student._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Student' : 'Add Student'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name" error={getFieldError('name')} required>
              <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={(e) => handleBlur('name', e.target.value)} className={`input-field ${getFieldError('name') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Email" error={getFieldError('email')} required>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={(e) => handleBlur('email', e.target.value)} className={`input-field ${getFieldError('email') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Phone" error={getFieldError('phone')}>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={(e) => handleBlur('phone', e.target.value)} className={`input-field ${getFieldError('phone') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Roll Number" error={getFieldError('rollNumber')} required>
              <input type="number" min="0" value={formData.rollNumber} onChange={(e) => handleChange('rollNumber', e.target.value)} onBlur={(e) => handleBlur('rollNumber', e.target.value)} className={`input-field ${getFieldError('rollNumber') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Class" error={getFieldError('class')} required>
              <select value={formData.class} onChange={(e) => handleChange('class', e.target.value)} onBlur={(e) => handleBlur('class', e.target.value)} className={`input-field ${getFieldError('class') ? 'error' : ''}`}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Section" error={getFieldError('section')}>
              <input type="text" value={formData.section} onChange={(e) => handleChange('section', e.target.value)} onBlur={(e) => handleBlur('section', e.target.value)} className={`input-field ${getFieldError('section') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Parent Name" error={getFieldError('parentName')}>
              <input type="text" value={formData.parentName} onChange={(e) => handleChange('parentName', e.target.value)} onBlur={(e) => handleBlur('parentName', e.target.value)} className={`input-field ${getFieldError('parentName') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Parent Phone" error={getFieldError('parentPhone')}>
              <input type="text" value={formData.parentPhone} onChange={(e) => handleChange('parentPhone', e.target.value)} onBlur={(e) => handleBlur('parentPhone', e.target.value)} className={`input-field ${getFieldError('parentPhone') ? 'error' : ''}`} />
            </FormField>
            <FormField label="Parent Email" error={getFieldError('parentEmail')}>
              <input type="email" value={formData.parentEmail} onChange={(e) => handleChange('parentEmail', e.target.value)} onBlur={(e) => handleBlur('parentEmail', e.target.value)} className={`input-field ${getFieldError('parentEmail') ? 'error' : ''}`} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Address" error={getFieldError('address')}>
                <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} onBlur={(e) => handleBlur('address', e.target.value)} className={`input-field ${getFieldError('address') ? 'error' : ''}`} />
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
            <button type="submit" disabled={!isFormValid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">{editData ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Students;
