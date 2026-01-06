function EmptyState({ 
  icon = '📭', 
  title = 'No Data', 
  description = 'Get started by adding some data', 
  action = null 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

export default EmptyState;




