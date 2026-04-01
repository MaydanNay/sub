import React from 'react';
import './MobileLayout.css';

const MobileLayout = ({ children }) => {
  return (
    <div className="mobile-view">
      <div className="mobile-content">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
