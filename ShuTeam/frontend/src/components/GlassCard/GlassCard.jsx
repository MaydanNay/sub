import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, padding = '15px', className = '', onClick }) => {
  return (
    <div 
      className={`glass-card ${className}`} 
      style={{ padding }} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
