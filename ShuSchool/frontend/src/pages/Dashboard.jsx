import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Shield, Coins, Flame, Star, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

import NovelDialogue from '../components/NovelDialogue';

const Dashboard = () => {
    const { t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMascot, setActiveMascot] = useState(null);
    const [availableMascots] = useState(["1.PNG", "2.PNG", "3.PNG", "4.PNG", "5.PNG"]);

    // Novel Mode State
    const [showNovel, setShowNovel] = useState(false);
    const [novelText, setNovelText] = useState("");

    const startNovelDialogue = useCallback((text) => {
        setNovelText(text);
        setShowNovel(true);
    }, []);

    const getMascotMessage = useCallback(() => {
        if (!data) return t('mascot_greeting');
        
        const lowStat = data.stats.find(s => s.value < 20);
        const highStreak = data.streaks.find(s => s.days >= 5);
        
        if (lowStat) {
            return t('mascot_low_stat').replace('{stat}', lowStat.subject);
        }
        if (highStreak) {
            return t('mascot_high_streak').replace('{streak}', highStreak.label).replace('{days}', highStreak.days);
        }
        if (data.coins < 50) {
            return t('mascot_no_coins');
        }
        
        return t('mascot_default');
    }, [data, t]);

    const [pendingParents, setPendingParents] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [response, pendingRes] = await Promise.all([
                    api.get('/student/dashboard/me'),
                    api.get('/student/pending-parents')
                ]);
                const rawData = response.data;
                setPendingParents(pendingRes.data);

                const statsMap = [
                    { subject: t('economy'), value: rawData.character?.economy || 0 },
                    { subject: t('wisdom'), value: rawData.character?.wisdom || 0 },
                    { subject: t('influence'), value: rawData.character?.influence || 0 },
                    { subject: t('health'), value: rawData.character?.health || 0 },
                    { subject: t('strength'), value: rawData.character?.strength || 0 },
                    { subject: t('diplomacy'), value: rawData.character?.diplomacy || 0 },
                    { subject: t('technology'), value: rawData.character?.technology || 0 },
                    { subject: t('intellect'), value: rawData.character?.intellect || 0 },
                ];
                
                const charLevel = rawData.character?.level || 1;
                const charCoins = rawData.character?.coins || 0;
                const charSuper = rawData.character?.supercoins || 0;

                const dashboardData = {
                    user: { name: rawData.user?.full_name || t('student'), level: charLevel },
                    coins: charCoins,
                    supercoins: charSuper,
                    stats: statsMap,
                    streaks: (rawData.streaks || []).map(s => ({
                        icon: s.type === 'attendance' ? <Flame size={18} color="orange" /> : <Shield size={18} color="cyan" />,
                        label: s.type === 'attendance' ? t('nav_behavior') : t('nav_rating'),
                        days: s.current_count,
                        target: s.type === 'attendance' ? 15 : 7
                    })),
                    character: rawData.character
                };
                setData(dashboardData);

                if (rawData.character?.active_mascot) {
                    setActiveMascot(rawData.character.active_mascot);
                } else if (rawData.character?.unlocked_mascots?.length > 0) {
                    setActiveMascot(rawData.character.unlocked_mascots[0]);
                }

                setLoading(false);

                // Auto-show dialogue logic (Visual Novel style)
                const lastSeen = localStorage.getItem('mascot_vn_last_seen');
                const now = Date.now();
                if (!lastSeen || (now - parseInt(lastSeen)) > 3600000) { // 1 hour throttle
                    setTimeout(() => {
                        const msg = !rawData.character?.mascot_slots ? t('mascot_locked_msg') : t('mascot_default');
                        startNovelDialogue(msg);
                        localStorage.setItem('mascot_vn_last_seen', now.toString());
                    }, 1000);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                setError("Ошибка загрузки данных");
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [t, startNovelDialogue]);

    const handleSelectMascot = async (file) => {
        try {
            await api.post('/character/choose-mascot', null, { params: { mascot_file: file } });
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleConfirmParent = async (parentId, confirm) => {
        try {
            await api.post(`/student/confirm-parent/${parentId}?confirm=${confirm}`);
            setPendingParents(prev => prev.filter(p => p.id !== parentId));
            alert(confirm ? t('success') : t('rejected'));
        } catch (err) {
            alert(t('error'));
        }
    };

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>{t('loading')}</div>;
    if (error) return <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>{t('error')}: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <NovelDialogue 
                show={showNovel}
                onClose={() => setShowNovel(false)}
                text={novelText}
                mascotImg={activeMascot ? `/mascots/${activeMascot}` : "/mascots/system.PNG"}
                mascotName={activeMascot ? (t('mascot_name') || t('nav_profile')) : t('system_mascot_name')}
            />

            {/* Parent Requests Banner */}
            {pendingParents.map(parent => (
                <div key={parent.id} className="card glass-effect animate-bounce-in" style={{ background: 'var(--parent-gradient)', marginBottom: '20px', padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar user={parent} size={40} />
                        <div>
                            <p style={{ margin: 0, color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{parent.full_name} {t('wants_to_be_parent') || 'хочет стать вашим родителем'}</p>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>@{parent.username}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleConfirmParent(parent.id, true)} style={{ background: 'white', color: 'var(--bg-dark)', border: 'none', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}>{t('confirm')}</button>
                        <button onClick={() => handleConfirmParent(parent.id, false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}>{t('reject')}</button>
                    </div>
                </div>
            ))}

            {/* Header: User Info & Coins */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{data.user.name}</h2>
                    <p style={{ color: 'var(--accent-yellow)', fontSize: '18px', fontWeight: 'bold' }}>{t('level')} {data.user.level}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="chip">
                        <Coins size={16} /> {data.coins}
                    </div>
                    <div className="chip super">
                        <Star size={16} /> {data.supercoins}
                    </div>
                </div>
            </header>

            {/* Mascot Section */}
            {!data.character?.mascot_slots ? (
                // Locked State
                <div 
                    onClick={() => startNovelDialogue(t('mascot_locked_msg'))}
                    className="card mascot-tip locked clickable" 
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', marginTop: '20px', display: 'flex', gap: '15px', borderRadius: 'var(--radius-card)', padding: '20px', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer' }}
                >
                    <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img 
                            src="/mascots/system.PNG" 
                            alt="system" 
                            style={{ width: '60px', height: '60px', objectFit: 'contain', opacity: 0.6 }} 
                        />
                    </div>
                    <div>
                        <p style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px 0' }}>{t('system_mascot_says')}</p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>"{t('mascot_locked_msg')}"</p>
                    </div>
                </div>
            ) : data.character.unlocked_mascots?.length < data.character.mascot_slots ? (
                // Selection Mode
                <div className="card mascot-selection" style={{ background: 'var(--parent-gradient)', marginTop: '20px', borderRadius: 'var(--radius-card)', padding: '24px', textAlign: 'center' }}>
                    <h3 style={{ color: 'white', marginBottom: '15px' }}>🎁 {t('choose_mascot_title') || 'Выбери своего напарника!'}</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        {availableMascots.filter(m => !data.character.unlocked_mascots.includes(m)).map(m => (
                            <div 
                                key={m} 
                                className="mascot-option" 
                                onClick={() => handleSelectMascot(m)}
                                style={{ 
                                    width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', 
                                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent'
                                }}
                            >
                                <img src={`/mascots/${m}`} alt="mascot" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Active Mascot Card
                <div 
                    onClick={() => startNovelDialogue(getMascotMessage())}
                    className="card mascot-tip clickable" 
                    style={{ backgroundColor: 'var(--accent-yellow)', marginTop: '20px', borderRadius: 'var(--radius-card)', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                    {/* Top Row: Image & Text */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <div className="mascot-img-container" style={{ position: 'relative', flexShrink: 0 }}>
                            <img 
                                src={activeMascot ? `/mascots/${activeMascot}` : "/mascots/system.PNG"} 
                                alt="mascot" 
                                style={{ width: '70px', height: '70px', objectFit: 'contain' }} 
                            />
                            {data.character.unlocked_mascots.length > 1 && (
                                <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--text-dark)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: '900' }}>
                                    +{data.character.unlocked_mascots.length - 1}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <p style={{ fontWeight: 'bold', color: 'var(--text-dark)', margin: 0 }}>{t('mascot_says')}</p>
                                 <ChevronRight size={18} color="var(--text-dark)" />
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-dark)', margin: '4px 0 0 0', fontStyle: 'italic', lineHeight: '1.4' }}>"{getMascotMessage()}"</p>
                        </div>
                    </div>

                    {/* Bottom Row: Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                        <Link to="/mascot-room" className="btn-secondary" style={{ flex: 1, textDecoration: 'none', background: 'white', color: 'var(--text-dark)', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            🏠 {t('mascot_room')}
                        </Link>
                        <Link to="/marketplace" className="btn-secondary" style={{ flex: 1, textDecoration: 'none', background: 'white', color: 'var(--text-dark)', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            🛒 {t('marketplace')}
                        </Link>
                    </div>
                </div>
            )}

            {/* Streaks */}
            <div style={{ marginTop: '20px' }}>
                <h3 style={{ margin: '15px 10px', color: 'var(--text-white)' }}>{t('active_streaks')}</h3>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
                    {data.streaks.map((s, idx) => (
                        <div key={idx} className="streak-card" style={{ flex: '0 0 160px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {s.icon} <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{s.label}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${(s.days/s.target)*100}%` }}></div>
                            </div>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>{s.days}/{s.target} {t('days')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Radar Map */}
            <div className="card animate-fade-in" style={{ height: '340px', display: 'flex', justifyContent: 'center', position: 'relative', marginTop: '20px', marginBottom: '50px' }}>
                <h3 style={{ position: 'absolute', top: '15px', color: 'var(--text-dark)' }}>{t('stats_title')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.stats}>
                        <PolarGrid stroke="#666" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#333', fontSize: 10 }} />
                        <Radar
                            name="Stats"
                            dataKey="value"
                            stroke="var(--bg-dark)"
                            fill="var(--accent-green)"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <style sx>{`
                .chip {
                    background-color: var(--bg-card);
                    color: var(--text-dark);
                    padding: 6px 14px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
                .chip.super {
                    background-color: #ffd700;
                }
                .streak-card {
                    background-color: var(--bg-card);
                    color: var(--text-dark);
                    padding: 15px;
                    border-radius: 20px;
                    min-width: 150px;
                }
                .progress-bar {
                    background: #ccc;
                    height: 6px;
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-fill {
                    background: var(--accent-green);
                    height: 100%;
                    border-radius: 3px;
                }
                .mascot-tip:hover {
                    transform: scale(1.02);
                }
                .mascot-option:hover {
                    transform: scale(1.1);
                    background-color: rgba(255,255,255,0.4) !important;
                    border-color: white !important;
                }

                /* Visual Novel Animations */
                @keyframes bounceUp {
                    from { opacity: 0; transform: translateY(50px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
