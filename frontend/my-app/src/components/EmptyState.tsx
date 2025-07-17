import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  cta?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, cta }) => {
  return (
    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
};

export default EmptyState;

