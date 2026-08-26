import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@almosthack/utils';
import { X } from 'lucide-react';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerPortal = DialogPrimitive.Portal;

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[#171914]/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'right' | 'left' | 'bottom';
  showClose?: boolean;
}

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = 'right', showClose = true, ...props }, ref) => {
  const sideVariants = {
    right:
      'inset-y-0 right-0 h-full w-3/4 max-w-md border-l border-[#DCDDD3] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
    left:
      'inset-y-0 left-0 h-full w-3/4 max-w-md border-r border-[#DCDDD3] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    bottom:
      'inset-x-0 bottom-0 max-h-[85vh] border-t border-[#DCDDD3] rounded-t-[20px] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 bg-[#FFFDF8] p-6 shadow-modal duration-200 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col font-body text-[#171914]',
          sideVariants[side],
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[6px] p-1.5 text-[#6D7068] hover:text-[#171914] hover:bg-[#F7F4EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C45]">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

export const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex flex-col space-y-1 text-left pb-4 border-b border-[#DCDDD3]/70', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-bold font-heading text-[#171914]', className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;
