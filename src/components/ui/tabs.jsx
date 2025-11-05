import { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;

  const contextValue = useMemo(
    () => ({
      value: activeValue,
      setValue: (nextValue) => {
        onValueChange?.(nextValue);
        if (value === undefined) {
          setInternalValue(nextValue);
        }
      },
    }),
    [activeValue, onValueChange, value]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component.');
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]',
        isActive ? 'bg-white text-[#0066CC] shadow-sm' : 'text-slate-600 hover:text-slate-900',
        className
      )}
      onClick={() => context.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component.');
  }

  if (context.value !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={cn('mt-4 focus-visible:outline-none', className)} {...props}>
      {children}
    </div>
  );
}

