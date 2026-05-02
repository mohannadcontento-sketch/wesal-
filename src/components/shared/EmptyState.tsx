import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1 font-heading">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-text-secondary text-center max-w-sm mb-3 font-body">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
