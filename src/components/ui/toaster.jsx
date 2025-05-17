import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto-dismiss after timeout
    if (!toast.persistent) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  };
  
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

// Hook to use Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { addToast, dismissToast } = context;
  
  const toast = ({
    title,
    description,
    variant = 'default',
    duration = 5000,
    persistent = false,
  }) => {
    return addToast({ title, description, variant, duration, persistent });
  };
  
  return { toast, dismiss: dismissToast };
};

// Toast UI Component
const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 max-w-xs w-full flex flex-col space-y-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`bg-white rounded-lg shadow-lg p-4 transition-all transform-gpu translate-y-0 opacity-100 flex items-start ${
            toast.variant === 'destructive' 
              ? 'border-l-4 border-red-500' 
              : toast.variant === 'success' 
                ? 'border-l-4 border-green-500' 
                : 'border-l-4 border-blue-500'
          }`}
          role="alert"
        >
          <div className="flex-1">
            {toast.title && (
              <h3 className="font-medium text-gray-900">
                {toast.title}
              </h3>
            )}
            {toast.description && (
              <div className="mt-1 text-sm text-gray-500">
                {toast.description}
              </div>
            )}
          </div>
          <button 
            onClick={() => onDismiss(toast.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Toaster component to mount in the app
export const Toaster = () => {
  return (
    <ToastProvider>
      {/* Children would be placed here if used */}
    </ToastProvider>
  );
};