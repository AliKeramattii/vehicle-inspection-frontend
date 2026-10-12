import type { CSSProperties } from 'react';
export type IconName =
  | 'close' | 'guide-book' | 'light' | 'level' | 'speed' | 'check-circle'
  | 'switch-camera' | 'pause' | 'play' | 'record-stop' | 'orbit-arrow'
  | 'camera' | 'warning' | 'download';
export function SvgIcon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  const url = `/icons/inspection-360/${name}.svg`;
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: 'currentColor',
    mask: `url("${url}") center / contain no-repeat`,
    WebkitMask: `url("${url}") center / contain no-repeat`,
  };
  return <span aria-hidden="true" className={`svg-icon ${className}`} style={style} />;
}
