import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LogIn, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const Reception = () => {
    const [qrValue, setQrValue] = useState(null);
    const [qrError, setQrError] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [expiresIn, setExpiresIn] = useState(30);
    const { t } = useLanguage();

    // Clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Polling for QR Code
    useEffect(() => {
        const fetchQr = async () => {
            try {
                // api.get uses baseURL, should hit /api/attendance/reception-qr
                const resp = await api.get('/attendance/reception-qr');
                setQrValue(resp.data.code);
                setExpiresIn(resp.data.expires_in);
                setQrError(false);
            } catch (err) {
                console.error("Failed to fetch reception QR", err);
                // Never show a stale/static code: it would be rejected by the server
                setQrValue(null);
                setQrError(true);
            }
        };

        fetchQr();
        const interval = setInterval(fetchQr, 10000); // Check every 10s to sync accurately 
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw', 
            backgroundColor: 'var(--bg-dark)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1px' }}>
                    SHŪ <span style={{ color: 'var(--accent-yellow)' }}>SCHOOL</span>
                </h1>
                <p style={{ fontSize: '20px', color: '#888' }}>{t('scan_to_enter')}</p>
            </div>

            <div style={{ position: 'relative' }}>
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '40px', 
                    borderRadius: '30px', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {qrValue ? (
                        <QRCodeSVG 
                            value={qrValue} 
                            size={400} 
                            level="H"
                            includeMargin={true}
                        />
                    ) : (
                        <div style={{ width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: qrError ? '#ff4d4d' : '#888', fontSize: '20px' }}>
                            {qrError ? 'Нет связи с сервером. QR-код появится автоматически.' : '...'}
                        </div>
                    )}
                </div>
                {/* Visual indicator of refresh */}
                <div style={{ position: 'absolute', bottom: '-40px', width: '100%', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                    {t('refresh_in')} <span style={{ color: expiresIn <= 5 ? '#ff4d4d' : 'var(--accent-yellow)', fontWeight: 'bold' }}>{expiresIn} {t('seconds_short')}</span>
                </div>
            </div>

            <div style={{ marginTop: '70px', display: 'flex', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-green)' }}>
                    <LogIn size={32} />
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>{t('login_reception')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-yellow)' }}>
                    <Clock size={32} />
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>{currentTime}</span>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', color: '#444', fontSize: '14px' }}>
                Powered by SHŪ Studio & Antigravity
            </div>
            
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                .qr-container {
                    animation: pulse 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default Reception;
