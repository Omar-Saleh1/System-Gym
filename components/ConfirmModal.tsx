'use client';
import React from 'react';

export type ModalType = 'danger' | 'success' | 'warning' | 'info';

interface ConfirmModalProps {
  open: boolean;
  type?: ModalType;
  title: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string | null;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

const Icon3DDanger = () => (
  <div className="icon-3d-box danger">
    <div className="icon-3d-aura danger" />
    <svg className="icon-3d-svg" viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="dangerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="binGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" className="spin-ring" />
      <circle cx="50" cy="50" r="38" fill="url(#dangerGlow)" />
      
      {/* Lid */}
      <g className="floating-lid" filter="url(#shadow3D)">
        <rect x="30" y="24" width="40" height="7" rx="3.5" fill="url(#lidGrad)" />
        <path d="M42 24V19C42 17.8 42.9 17 44 17H56C57.1 17 58 17.8 58 19V24" stroke="url(#lidGrad)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      
      {/* Bin Body */}
      <g filter="url(#shadow3D)" className="floating-body">
        <path d="M34 33L38 74C38.4 77.3 41.2 80 44.5 80H55.5C58.8 80 61.6 77.3 62 74L66 33H34Z" fill="url(#binGrad)" />
        <line x1="43" y1="39" x2="44.5" y2="72" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <line x1="50" y1="39" x2="50" y2="72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <line x1="57" y1="39" x2="55.5" y2="72" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </g>
      
      {/* Sparks */}
      <circle cx="20" cy="28" r="3" fill="#fca5a5" className="sparkle-p1" />
      <circle cx="78" cy="38" r="3.5" fill="#ef4444" className="sparkle-p2" />
      <path d="M72 20L75 24L72 28L69 24Z" fill="#fecdd3" className="sparkle-p3" />
    </svg>
  </div>
);

const Icon3DSuccess = () => (
  <div className="icon-3d-box success">
    <div className="icon-3d-aura success" />
    <svg className="icon-3d-svg" viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="successGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="shadowGreen" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 4" opacity="0.4" className="spin-ring" />
      <circle cx="50" cy="50" r="36" fill="url(#successGlow)" />
      
      {/* 3D Sphere */}
      <circle cx="50" cy="50" r="28" fill="url(#checkGrad)" filter="url(#shadowGreen)" className="floating-body" />
      
      {/* Checkmark */}
      <path d="M37 50L46 59L64 41" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadowGreen)" className="floating-lid" />
      
      {/* Sparkles */}
      <circle cx="22" cy="30" r="3" fill="#86efac" className="sparkle-p1" />
      <path d="M74 22L77 26L74 30L71 26Z" fill="#bbf7d0" className="sparkle-p2" />
      <circle cx="78" cy="65" r="3.5" fill="#4ade80" className="sparkle-p3" />
    </svg>
  </div>
);

const Icon3DWarning = () => (
  <div className="icon-3d-box warning">
    <div className="icon-3d-aura warning" />
    <svg className="icon-3d-svg" viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="warnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id="shadowAmber" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" className="spin-ring" />
      <circle cx="50" cy="50" r="36" fill="url(#warnGlow)" />
      
      {/* 3D Shield Triangle */}
      <g filter="url(#shadowAmber)" className="floating-body">
        <path d="M50 20L78 72C79.5 74.8 77.5 78 74.3 78H25.7C22.5 78 20.5 74.8 22 72L50 20Z" fill="url(#warnGrad)" />
        <path d="M50 36V54" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="50" cy="65" r="3.5" fill="#ffffff" />
      </g>
      
      {/* Energy Sparks */}
      <path d="M22 28L25 32L22 36L19 32Z" fill="#fde68a" className="sparkle-p1" />
      <circle cx="78" cy="30" r="3" fill="#f59e0b" className="sparkle-p2" />
    </svg>
  </div>
);

const Icon3DInfo = () => (
  <div className="icon-3d-box info">
    <div className="icon-3d-aura info" />
    <svg className="icon-3d-svg" viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="infoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="infoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="shadowBlue" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" opacity="0.4" className="spin-ring" />
      <circle cx="50" cy="50" r="36" fill="url(#infoGlow)" />
      
      {/* 3D Sphere */}
      <g filter="url(#shadowBlue)" className="floating-body">
        <circle cx="50" cy="50" r="28" fill="url(#infoGrad)" />
        <circle cx="50" cy="39" r="3.5" fill="#ffffff" />
        <path d="M50 47V63" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      </g>
      
      {/* Light sparkles */}
      <circle cx="20" cy="35" r="3" fill="#93c5fd" className="sparkle-p1" />
      <path d="M76 24L79 28L76 32L73 28Z" fill="#bfdbfe" className="sparkle-p2" />
    </svg>
  </div>
);

const RENDER_3D_ICON: Record<ModalType, () => React.JSX.Element> = {
  danger: Icon3DDanger,
  success: Icon3DSuccess,
  warning: Icon3DWarning,
  info: Icon3DInfo,
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  type = 'danger',
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  children,
}) => {
  if (!open) return null;

  const handleClose = () => {
    if (onCancel) onCancel();
    else onConfirm();
  };

  const IconComponent = RENDER_3D_ICON[type] || RENDER_3D_ICON.danger;

  return (
    <div className="confirm-overlay" onClick={handleClose}>
      <div className="confirm-card 3d-modal-wrapper" onClick={e => e.stopPropagation()}>
        {/* 3D SVG Animated Visual Icon */}
        <div className="confirm-3d-header">
          <IconComponent />
        </div>

        <div className="confirm-title">{title}</div>
        {message && <div className="confirm-body">{message}</div>}
        {children && <div style={{ marginBottom: '20px' }}>{children}</div>}

        <div className="confirm-actions">
          {cancelText !== null && onCancel && (
            <button className="confirm-cancel 3d-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`confirm-ok ${type} 3d-btn-ok`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
