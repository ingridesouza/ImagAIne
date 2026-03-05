import clsx from 'clsx';

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <div
    className={clsx(
      'animate-shimmer rounded-xl',
      className,
    )}
    style={style}
  />
);

const BENTO_RATIOS = ['3/4', '1/1', '4/5', '16/9', '1/1', '3/4', '4/3', '3/4', '1/1', '16/9', '4/5', '1/1'];

export const GalleryGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="masonry-grid" aria-hidden>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="masonry-item overflow-hidden rounded-xl bg-surface-dark ring-1 ring-white/5">
        <Skeleton
          className="w-full rounded-none"
          style={{ aspectRatio: BENTO_RATIOS[i % BENTO_RATIOS.length] }}
        />
        <div className="flex items-center gap-3 p-3">
          <Skeleton className="h-3 flex-1 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export const ImageGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="image-grid" aria-hidden>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="overflow-hidden rounded-xl bg-surface-dark ring-1 ring-white/5">
        <Skeleton className="w-full rounded-none" style={{ aspectRatio: '1/1' }} />
        <div className="space-y-2 p-3">
          <Skeleton className="h-3 w-3/4 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
    <Skeleton className="h-3 w-20 rounded-md" />
    <Skeleton className="h-7 w-12 rounded-md" />
    <Skeleton className="h-2.5 w-28 rounded-md" />
  </div>
);

export const DashboardSkeleton = () => (
  <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10" aria-hidden>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
      <ImageGridSkeleton count={3} />
    </div>
  </section>
);
