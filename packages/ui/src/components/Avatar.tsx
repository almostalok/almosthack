import React from 'react';
import { cn } from '@almosthack/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
    xl: 'w-3.5 h-3.5 bottom-1 right-1',
  };

  const statusColors = {
    online: 'bg-[#355C45] ring-[#FFFDF8]',
    busy: 'bg-[#8B2C24] ring-[#FFFDF8]',
    offline: 'bg-[#6D7068] ring-[#FFFDF8]',
  };

  const initial = name ? name.trim().charAt(0).toUpperCase() : (alt ? alt.trim().charAt(0).toUpperCase() : 'U');

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-[#E2EBDD] text-[#274535] font-heading font-bold border border-[#DCDDD3] select-none shrink-0 overflow-hidden shadow-2xs',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span>{initial}</span>
      )}
      {status && (
        <span
          className={cn(
            'absolute rounded-full ring-2',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
