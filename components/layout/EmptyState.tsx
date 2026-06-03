interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-cream-dark flex items-center justify-center text-navy-300 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-navy-900 mb-1.5">{title}</h3>
      <p className="text-sm text-navy-700 max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
