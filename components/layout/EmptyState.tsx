interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export default function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8 px-4" : "py-16 px-6"}`}>
      <div
        className="flex items-center justify-center mb-5"
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #f0ebe3 0%, #e8e0d8 100%)",
          border: "1px solid #e8e0d8",
        }}
      >
        {icon}
      </div>
      <h3
        className="font-semibold mb-2"
        style={{ color: "#1a1714", fontSize: compact ? 14 : 16 }}
      >
        {title}
      </h3>
      <p
        className="mb-5 max-w-xs leading-relaxed"
        style={{ color: "#6b5f54", fontSize: compact ? 12 : 13 }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}
