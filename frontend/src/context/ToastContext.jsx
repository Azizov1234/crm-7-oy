import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000,
  });

  const closeToast = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const notify = useCallback((message, severity = 'info', duration = 4000) => {
    setToast({
      open: true,
      message: String(message || ''),
      severity,
      duration,
    });
  }, []);

  const value = useMemo(
    () => ({
      notify,
      success: (message, duration) => notify(message, 'success', duration),
      error: (message, duration) => notify(message, 'error', duration),
      warning: (message, duration) => notify(message, 'warning', duration),
      info: (message, duration) => notify(message, 'info', duration),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            minWidth: 300,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
            ...(toast.severity === 'error' && {
              bgcolor: '#dc2626',
              color: '#fff',
            }),
          }}
          action={
            <IconButton size="small" color="inherit" onClick={closeToast}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}
