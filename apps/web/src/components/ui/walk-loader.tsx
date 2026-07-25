import { cn } from '@/lib/utils';

/** 걷기 스프라이트 애니메이션 (797x151, 8프레임). */
function WalkLoader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="walk-loader"
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-walk h-[151px] w-[100px] bg-[url('/walk-cycle.png')] bg-no-repeat",
        className,
      )}
      {...props}
    />
  );
}

function WalkLoaderOverlay({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <WalkLoader />
    </div>
  );
}

export { WalkLoader, WalkLoaderOverlay };
