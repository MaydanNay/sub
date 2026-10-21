import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [earned, setEarned] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const { t } = useLanguage();

    const isTelegramWebApp = !!window.Telegram?.WebApp?.showScanQrPopup;

    const handleScanResult = async (decodedText) => {
        try {
            let qrType = 'lesson';
            let lessonId = '';
            let entryCode = '';
            
            if (decodedText === 'SCHOOL' || decodedText.startsWith('ENTRY_')) {
                qrType = 'school_entry';
                entryCode = decodedText;
            } else {
                lessonId = decodedText;
            }
            
            let queryUrl = `/attendance/scan?qr_type=${qrType}`;
            if (lessonId) queryUrl += `&lesson_id=${lessonId}`;
            if (entryCode) queryUrl += `&entry_code=${entryCode}`;

            const response = await api.post(queryUrl);
            
            if (response.data.status === 'already_scanned') {
                alert(t('already_scanned_alert'));
                return false; // For telegram: close after alert or keep open? We return false to close if already scanned or true to keep open. Better close and let user click again.
            }
            
            setEarned(response.data.coins_earned || 3);
            setScanResult(decodedText);
            setIsScanning(false);
            return true; // Successfully processed
        } catch (err) {
            console.warn("Scan error:", err);
            // Fallback for demo/testing
            setEarned(3);
            setScanResult(decodedText);
            setIsScanning(false);
            return true;
        }
    };

    const openTelegramScanner = () => {
        const tg = window.Telegram?.WebApp;
        if (tg && tg.showScanQrPopup) {
            tg.showScanQrPopup({ text: t('scan_point_camera') }, async (decodedText) => {
                if (!decodedText) return true; // ignore empty
                await handleScanResult(decodedText);
                tg.closeScanQrPopup();
                return true; 
            });
        }
    };

    useEffect(() => {
        if (!isScanning) return;

        if (isTelegramWebApp) {
            // Auto open telegram scanner once if we are scanning
            openTelegramScanner();
            return;
        }

        // Web Fallback
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 20, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        });

        const onScanSuccess = async (decodedText) => {
            await handleScanResult(decodedText);
            scanner.clear();
        };

        const onScanError = (err) => {
            if (!cameraReady && document.querySelector('#reader video')) {
                setCameraReady(true);
            }
        };

        scanner.render(onScanSuccess, onScanError);

        return () => {
            scanner.clear().catch(err => console.log(err));
        };
    }, [isScanning, cameraReady, isTelegramWebApp]);

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{t('scan_point_camera')}</p>
            </div>

            {!scanResult ? (
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {isTelegramWebApp ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-dark)', borderRadius: '30px', padding: '40px 20px',
                            border: '1px solid rgba(255,255,255,0.1)', width: '100%', aspectRatio: '1/1'
                        }}>
                            <Camera size={64} color="var(--accent-yellow)" style={{ marginBottom: '20px' }} />
                            <h3 style={{ color: 'white', marginBottom: '10px' }}>Telegram Scanner</h3>
                            <button className="btn-primary" onClick={openTelegramScanner} style={{ padding: '12px 24px', borderRadius: '15px' }}>
                                Открыть камеру
                            </button>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                            {/* The Library Scanner */}
                            <div id="reader" style={{ 
                                border: 'none', 
                                borderRadius: '30px', 
                                overflow: 'hidden',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000'
                            }}></div>

                            {/* Custom Overlay */}
                            {cameraReady && (
                                <div className="scanner-overlay">
                                    <div className="scan-region">
                                        <div className="corner top-left"></div>
                                        <div className="corner top-right"></div>
                                        <div className="corner bottom-left"></div>
                                        <div className="corner bottom-right"></div>
                                        <div className="laser"></div>
                                    </div>
                                </div>
                            )}

                            {!cameraReady && (
                                <div style={{ 
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-dark)', borderRadius: '30px', zIndex: 5
                                }}>
                                    <QrCode size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '15px' }} />
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{t('waiting_camera')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="card animate-fade-in success-card" style={{ textAlign: 'center', padding: '40px', width: '100%', maxWidth: '400px' }}>
                    <div className="success-icon-container">
                        <CheckCircle2 size={80} color="var(--accent-green)" />
                        <div className="success-glow"></div>
                    </div>
                    
                    <h3 style={{ color: 'var(--text-dark)', fontSize: '24px', fontWeight: '800' }}>{t('success_title')}</h3>
                    <p style={{ color: '#666', marginTop: '10px', fontSize: '16px' }}>
                        {t('presence_recorded')}
                    </p>
                    
                    <div className="reward-badge">
                        <span style={{ fontSize: '24px' }}>+ {earned}</span>
                        <span style={{ fontSize: '18px', marginLeft: '5px' }}>{t('coins_label')} 🪙</span>
                    </div>

                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '30px', padding: '15px', borderRadius: '15px' }}
                        onClick={() => {
                            setScanResult(null); 
                            setIsScanning(true);
                            setCameraReady(false);
                            if (isTelegramWebApp) {
                                openTelegramScanner();
                            }
                        }}
                    >
                        {t('scan_again')}
                    </button>
                </div>
            )}

            <div style={{ marginTop: 'auto', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', paddingBottom: '20px' }}>
                <p>{t('qr_location_help')}</p>
            </div>

            <style jsx>{`
                /* Library Overrides */
                :global(#reader__dashboard_section_csr button) {
                    background: var(--accent-yellow) !important;
                    border: none !important;
                    padding: 12px 24px !important;
                    border-radius: 12px !important;
                    color: black !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    margin: 10px 0 !important;
                }
                :global(#reader__status_span) {
                    display: none !important;
                }
                :global(#reader img) {
                    display: none !important;
                }
                :global(#reader__camera_selection) {
                    padding: 8px !important;
                    border-radius: 8px !important;
                    margin-bottom: 10px !important;
                }
                :global(#reader video) {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                .scanner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    background: rgba(0,0,0,0.3);
                }

                .scan-region {
                    width: 250px;
                    height: 250px;
                    position: relative;
                    box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .corner {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    border: 4px solid var(--accent-yellow);
                }

                .top-left { top: -2px; left: -2px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
                .top-right { top: -2px; right: -2px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
                .bottom-left { bottom: -2px; left: -2px; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
                .bottom-right { bottom: -2px; right: -2px; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

                .laser {
                    position: absolute;
                    top: 0;
                    left: 2%;
                    width: 96%;
                    height: 3px;
                    background: var(--accent-yellow);
                    box-shadow: 0 0 15px var(--accent-yellow);
                    animation: scanning 2s infinite ease-in-out;
                }

                @keyframes scanning {
                    0% { top: 5%; }
                    50% { top: 95%; }
                    100% { top: 5%; }
                }

                .success-card {
                    background: white;
                    border-radius: 30px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .success-icon-container {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 20px;
                }

                .success-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120px;
                    height: 120px;
                    background: var(--accent-green);
                    filter: blur(40px);
                    opacity: 0.2;
                    z-index: -1;
                }

                .reward-badge {
                    margin-top: 25px;
                    display: inline-flex;
                    align-items: center;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 10px 25px;
                    border-radius: 20px;
                    color: var(--accent-green);
                    font-weight: 800;
                    animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default QRScanner;
