import { Drama } from 'lucide-react';

function EmptyState({
  icon = <Drama size={48} className="text-gray-400" />,
  title = 'No Data',
  description = 'Get started by adding some data',
  action = null
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 flex items-center justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
