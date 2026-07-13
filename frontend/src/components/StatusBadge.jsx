const statusStyles = {
  present: 'badge-green',
  absent: 'badge-red',
  late: 'badge-yellow',
  paid: 'badge-green',
  unpaid: 'badge-gray',
  partial: 'badge-yellow',
  overdue: 'badge-red',
  active: 'badge-green',
  past: 'badge-gray',
  submitted: 'badge-blue',
  graded: 'badge-purple',
  urgent: 'badge-red',
  important: 'badge-yellow',
  normal: 'badge-gray',
  admin: 'badge-purple',
  teacher: 'badge-blue',
  student: 'badge-green',
  midterm: 'badge-blue',
  final: 'badge-purple',
  quiz: 'badge-green',
  'unit-test': 'badge-yellow',
};

const StatusBadge = ({ status, children }) => {
  const style = statusStyles[status] || 'badge-gray';
  return <span className={style}>{children || status}</span>;
};

export default StatusBadge;
