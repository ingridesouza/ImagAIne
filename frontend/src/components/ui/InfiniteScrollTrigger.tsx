import { useEffect, useRef } from 'react';

type InfiniteScrollTriggerProps = {
  onTrigger: () => void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
};

export const InfiniteScrollTrigger = ({
  onTrigger,
  hasMore,
  isLoading,
  rootMargin = '200px',
}: InfiniteScrollTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onTrigger();
        }
      },
      { rootMargin }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [onTrigger, hasMore, isLoading, rootMargin]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className="flex items-center justify-center py-8"
      aria-hidden
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-fg-sec">
          <span className="material-symbols-outlined animate-spin text-[18px]">
            progress_activity
          </span>
          <span>Carregando mais...</span>
        </div>
      )}
    </div>
  );
};
