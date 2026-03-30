type LoadMoreButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  loadedCount: number;
  totalCount: number;
};

export const LoadMoreButton = ({
  onClick,
  isLoading = false,
  hasMore = true,
  loadedCount,
  totalCount,
}: LoadMoreButtonProps) => {
  if (!hasMore && loadedCount > 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="material-symbols-outlined text-fg-muted">check_circle</span>
        <p className="text-sm text-fg-sec">
          Todas as {totalCount} imagens carregadas
        </p>
      </div>
    );
  }

  if (loadedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2 rounded-full px-6 py-3
          bg-surface text-fg transition-all
          hover:bg-inset hover:text-fg
          focus:outline-none focus:ring-2 focus:ring-accent
          disabled:cursor-wait disabled:opacity-60
        `}
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">
              progress_activity
            </span>
            <span>Carregando...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
            <span>Carregar mais</span>
          </>
        )}
      </button>
      <p className="text-xs text-fg-muted">
        {loadedCount} de {totalCount} imagens
      </p>
    </div>
  );
};
