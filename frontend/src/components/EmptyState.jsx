const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
