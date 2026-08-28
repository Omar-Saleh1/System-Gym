'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmModalProps {
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ memberName, onConfirm, onCancel }) => {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Icon */}
        <div className="delete-modal-icon-wrap">
          <div className="delete-modal-icon-ring" />
          <ExclamationTriangleIcon className="delete-modal-icon" />
        </div>

        {/* Text */}
        <h3 className="delete-modal-title">تأكيد الحذف</h3>
        <p className="delete-modal-body">
          هتحذف العضو <span className="delete-modal-name">"{memberName}"</span> نهائياً؟
          <br />
          <span style={{ fontSize: '12px', opacity: 0.6 }}>الإجراء ده مش هيتراجع عنه.</span>
        </p>

        {/* Buttons */}
        <div className="delete-modal-actions">
          <button className="delete-modal-cancel" onClick={onCancel}>
            إلغاء
          </button>
          <button className="delete-modal-confirm" onClick={onConfirm}>
            نعم، احذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
