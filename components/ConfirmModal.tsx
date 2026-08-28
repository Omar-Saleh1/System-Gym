'use client';
import React from 'react';

export type ModalType = 'danger' | 'success' | 'warning' | 'info';

interface ConfirmModalProps {
  open: boolean;
  type?: ModalType;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const TYPE_ICONS: Record<ModalType, string> = {
  danger:  '🗑️',
  success: '✅',
  warning: '⚠️',
  info:    'ℹ️',
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
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon-wrap ${type}`}>
          <span>{TYPE_ICONS[type]}</span>
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-body">{message}</div>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>{cancelText}</button>
          <button className={`confirm-ok ${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
