import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText) => {
      // Expected format: SHUTEAM:MEETING_ID:USER_PHONE
      if (decodedText.startsWith('SHUTEAM:')) {
        scanner.clear();
        onScan(decodedText);
      }
    };

    const onScanFailure = (error) => {
      // Quietly ignore scan failures to avoid spamming
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup error", err));
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-overlay" onClick={onClose}>
      <div className="qr-scanner-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-scanner-header">
          <h3>Сканирование билета</h3>
          <button className="qr-close-btn" onClick={onClose}>×</button>
        </div>
        <div id="qr-reader"></div>
        <div className="qr-scanner-hint">Наведите камеру на QR-код участника</div>
      </div>
    </div>
  );
};

export default QRScanner;
