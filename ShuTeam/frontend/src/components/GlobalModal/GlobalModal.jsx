import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './GlobalModal.css';

const GlobalModal = () => {
  const { modal, handleClose } = useNotification();

  if (!modal.isOpen) return null;

  return (
    <div className="gm-overlay" onClick={() => handleClose(false)}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gm-content">
          <h3 className="gm-title">{modal.title}</h3>
          <p className="gm-message">{modal.message}</p>
        </div>
        <div className="gm-footer">
          {modal.type === 'confirm' && (
            <button 
              className="gm-btn gm-btn-cancel" 
              onClick={() => handleClose(false)}
            >
              Отмена
            </button>
          )}
          <button 
            className="gm-btn gm-btn-ok" 
            onClick={() => handleClose(true)}
          >
            ОК
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
