import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 text-center max-w-sm mb-3">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
