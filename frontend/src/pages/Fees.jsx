import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { feeService, classService, studentService } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { PageLoading } from '../components/LoadingSpinner';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({ student: '', class: '', feeType: 'tuition', amount: '', dueDate: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), remarks: '' });
  const [paymentData, setPaymentData] = useState({ paidAmount: '', paymentMode: 'cash', paymentDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchData(); }, [classFilter, statusFilter]);

  const fetchData = async () => {
    try {
      const params = {};
      if (classFilter) params.class = classFilter;
      if (statusFilter) params.status = statusFilter;
      const [feeRes, classRes, statsRes] = await Promise.all([
        feeService.getFees(params), classService.getClasses(), feeService.getFeeStats(params)
      ]);
      setFees(feeRes.data.fees); setClasses(classRes.data.classes); setStats(statsRes.data.stats);
    } catch { toast.error('Failed to fetch fee data'); } finally { setLoading(false); }
  };

  const handleClassChange = async (classId) => {
    setFormData({ ...formData, class: classId, student: '' });
    if (!classId) { setStudents([]); return; }
    try { const res = await studentService.getStudents({ class: classId, limit: 100 }); setStudents(res.data.students); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.createFee(formData);
      toast.success('Fee record created');
      setShowModal(false); fetchData();
      setFormData({ student: '', class: '', feeType: 'tuition', amount: '', dueDate: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), remarks: '' });
      setStudents([]);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    try { await feeService.updateFee(editData._id, paymentData); toast.success('Payment recorded'); setShowPaymentModal(false); setEditData(null); fetchData(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee record?')) return;
    try { await feeService.deleteFee(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const openPaymentModal = (fee) => {
    setEditData(fee);
    setPaymentData({ paidAmount: fee.amount - fee.paidAmount, paymentMode: 'cash', paymentDate: new Date().toISOString().split('T')[0], remarks: '' });
    setShowPaymentModal(true);
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Fees Management</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Track and manage fee collections</p>
        </div>
        <button onClick={() => { setShowModal(true); }} className="btn-primary">
          <PlusIcon className="h-5 w-5" /> Add Fee Record
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
          <div className="card p-5">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Due</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">${stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Collected</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${stats.totalCollected.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">${stats.totalPending.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Unpaid / Overdue</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.unpaidCount + stats.overdueCount}</p>
          </div>
        </div>
      )}

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="input-field w-full sm:w-44">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full sm:w-44">
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? <PageLoading /> : fees.length === 0 ? (
        <EmptyState icon={CurrencyDollarIcon} title="No fee records" description="Add a fee record to get started"
          action={<button onClick={() => setShowModal(true)} className="btn-primary"><PlusIcon className="h-5 w-5" /> Add Fee Record</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead><tr>
                <th className="table-header">Student</th>
                <th className="table-header">Roll No</th>
                <th className="table-header">Class</th>
                <th className="table-header">Fee Type</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Due</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {fees.map((fee, i) => (
                  <tr key={fee._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
                    <td className="table-cell font-medium">{fee.student?.user?.name}</td>
                    <td className="table-cell text-surface-500 font-mono text-xs">{fee.student?.rollNumber}</td>
                    <td className="table-cell">{fee.class?.name}</td>
                    <td className="table-cell capitalize"><span className="badge-blue">{fee.feeType}</span></td>
                    <td className="table-cell font-semibold">${fee.amount}</td>
                    <td className="table-cell">${fee.paidAmount}</td>
                    <td className="table-cell font-semibold">${fee.amount - fee.paidAmount}</td>
                    <td className="table-cell text-surface-500 text-xs">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="table-cell"><StatusBadge status={fee.status} /></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openPaymentModal(fee)} className="btn-ghost p-2 rounded-xl text-green-600 hover:bg-green-50" title="Collect Payment"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(fee._id)} className="btn-ghost p-2 rounded-xl text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setStudents([]); }} title="Add Fee Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Class</label>
            <select value={formData.class} onChange={(e) => handleClassChange(e.target.value)} className="input-field" required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Student</label>
            <select value={formData.student} onChange={(e) => setFormData({ ...formData, student: e.target.value })} className="input-field" required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Fee Type</label>
              <select value={formData.feeType} onChange={(e) => setFormData({ ...formData, feeType: e.target.value })} className="input-field">
                <option value="tuition">Tuition</option>
                <option value="transport">Transport</option>
                <option value="library">Library</option>
                <option value="lab">Lab</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Amount ($)</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" required min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Month</label>
              <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })} className="input-field">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Year</label>
              <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} className="input-field">
                {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Remarks</label>
              <input type="text" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
            <button type="button" onClick={() => { setShowModal(false); setStudents([]); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); setEditData(null); }} title="Collect Payment">
        {editData && (
          <form onSubmit={handleCollectPayment} className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-700/50 mb-4">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{editData.student?.user?.name}</p>
              <p className="text-xs text-surface-500">{editData.feeType} - ${editData.amount} | Balance: <strong>${editData.amount - editData.paidAmount}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Amount to Collect ($)</label>
              <input type="number" value={paymentData.paidAmount} onChange={(e) => setPaymentData({ ...paymentData, paidAmount: e.target.value })} className="input-field" required min={1} max={editData.amount - editData.paidAmount} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Payment Mode</label>
              <select value={paymentData.paymentMode} onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })} className="input-field">
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
                <option value="bank transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Payment Date</label>
              <input type="date" value={paymentData.paymentDate} onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Remarks</label>
              <input type="text" value={paymentData.remarks} onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })} className="input-field" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-700/50">
              <button type="button" onClick={() => { setShowPaymentModal(false); setEditData(null); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Record Payment</button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Fees;
