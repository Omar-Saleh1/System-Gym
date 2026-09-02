'use client';

import React from 'react';
import ConfirmModal from './ConfirmModal';

interface DeleteConfirmModalProps {
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ memberName, onConfirm, onCancel }) => {
  return (
    <ConfirmModal
      open={true}
      type="danger"
      title="تأكيد الحذف"
      message={
        <span>
          هتحذف العضو <strong className="confirm-highlight">"{memberName}"</strong> نهائياً؟
          <br />
          <span style={{ fontSize: '12px', opacity: 0.6 }}>الإجراء ده مش هيتراجع عنه.</span>
        </span>
      }
      confirmText="نعم، احذف"
      cancelText="إلغاء"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default DeleteConfirmModal;

