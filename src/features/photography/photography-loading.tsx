export function PhotographyLoading({ message }: { message: string }) {
  return <div className="photography-skeleton" role="status" aria-busy="true">
    <span className="sr-only">{message}</span>
    <div aria-hidden="true"><div className="skeleton-progress" /><div className="skeleton-image" /><div className="skeleton-controls" /><div className="skeleton-cards"><span /><span /><span /></div></div>
  </div>;
}
