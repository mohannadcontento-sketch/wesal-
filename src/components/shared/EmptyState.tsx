interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/10 text-primary-container mb-3">
        <span className="material-symbols-outlined text-[28px] filled">{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-on-surface mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-on-surface-variant text-center max-w-sm mb-3">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary-container text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
