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

const TYPE_ICONS: Record<ModalType, { emoji: string; badge3D: string }> = {
  danger:  { emoji: '🗑️', badge3D: '💥' },
  success: { emoji: '✅', badge3D: '✨' },
  warning: { emoji: '⚠️', badge3D: '⚡' },
  info:    { emoji: 'ℹ️', badge3D: '💡' },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  type = 'danger',
  title,
  message,
  confirmText = 'تأكيد',
  cancelText  = 'إلغاء',
  onConfirm,
  onCancel,
  children,
}) => {
  if (!open) return null;

  const handleClose = () => {
    if (onCancel) onCancel();
    else onConfirm();
  };

  const iconInfo = TYPE_ICONS[type] || TYPE_ICONS.danger;

  return (
    <div className="confirm-overlay" onClick={handleClose}>
      <div className="confirm-card 3d-modal" onClick={e => e.stopPropagation()}>
        {/* 3D Icon Container */}
        <div className={`confirm-icon-wrap ${type} icon-3d-wrap`}>
          <div className="icon-3d-glow" />
          <span className="icon-3d-main">{iconInfo.emoji}</span>
          <span className="icon-3d-badge">{iconInfo.badge3D}</span>
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


