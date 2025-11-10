import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3200 }) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      const payload = { id, title, description, variant };
      setToasts((prev) => [...prev, payload]);

      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed top-4 right-4 z-[1000] flex w-80 flex-col gap-3">
          {toasts.map((item) => (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto rounded-lg border px-4 py-3 shadow-lg transition-all',
                item.variant === 'destructive'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-900'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  {item.title && <p className="text-sm font-semibold">{item.title}</p>}
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="ml-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => dismiss(item.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
