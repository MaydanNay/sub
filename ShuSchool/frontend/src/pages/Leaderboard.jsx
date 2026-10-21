import React, { useState, useEffect } from 'react';
import { Shield, Coins, Star, User } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Leaderboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [scope, setScope] = useState('school'); // 'school' or 'class'
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/student/leaderboard?scope=${scope}`);
                setLeaderboard(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [scope]);

    const TopThree = ({ students }) => {
        const podium = [
            { pos: 2, color: '#C0C0C0', icon: '🥈', student: students[1] },
            { pos: 1, color: '#FFD700', icon: '🥇', student: students[0] },
            { pos: 3, color: '#CD7F32', icon: '🥉', student: students[2] },
        ];

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px', padding: '40px 0 20px' }}>
                {podium.map((p, idx) => (
                    p.student && (
                        <div key={idx} style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: '10px' }}>
                                <div style={{ 
                                    width: p.pos === 1 ? '85px' : '70px', 
                                    height: p.pos === 1 ? '85px' : '70px', 
                                    borderRadius: '50%', 
                                    border: `3px solid ${p.color}`,
                                    overflow: 'hidden',
                                    margin: '0 auto',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    boxShadow: `0 0 12px ${p.color}22`
                                }}>
                                    {p.student.profile_image ? (
                                        <img src={p.student.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User color="white" size={p.pos === 1 ? 36 : 28} />
                                        </div>
                                    )}
                                </div>
                                <span style={{ position: 'absolute', bottom: '-5px', right: '0', fontSize: '26px' }}>{p.icon}</span>
                            </div>
                            <p style={{ fontWeight: 'bold', fontSize: '14px', maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>
                                {p.student.full_name.split(' ')[0]}
                            </p>
                            <div style={{ 
                                display: 'inline-block', 
                                padding: '2px 8px', 
                                borderRadius: '10px', 
                                background: 'rgba(255,215,0,0.2)', 
                                color: '#FFD700', 
                                fontSize: '11px', 
                                fontWeight: 'bold' 
                            }}>
                                Lvl {p.student.level}
                            </div>
                        </div>
                    )
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: '0 20px 100px', background: 'transparent', minHeight: '100%' }}>
            {/* Toggle Switch */}
            {['student', 'teacher'].includes(user.role) ? (
                <div style={{ 
                    display: 'flex', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '16px', 
                    padding: '4px', 
                    margin: '20px 0',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button 
                        onClick={() => setScope('school')}
                        style={{ 
                            flex: 1, 
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: scope === 'school' ? 'var(--accent-yellow)' : 'transparent',
                            color: scope === 'school' ? 'var(--text-dark)' : 'white',
                            fontWeight: 'bold',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                    >
                        {t('whole_school')}
                    </button>
                    <button 
                        onClick={() => setScope('class')}
                        style={{ 
                            flex: 1, 
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: scope === 'class' ? 'var(--accent-yellow)' : 'transparent',
                            color: scope === 'class' ? 'var(--text-dark)' : 'white',
                            fontWeight: 'bold',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                    >
                        {t('my_class')}
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', margin: '30px 0 10px' }}>
                    <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', opacity: 0.9 }}>
                        {t('view_general_leaderboard')}
                    </h2 >
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
                    <div className="spinner" style={{ marginBottom: '15px' }}>⏳</div>
                    {t('loading_leaderboard')}
                </div>
            ) : (
                <>
                    {leaderboard.length >= 1 && <TopThree students={leaderboard} />}
                    
                    <div className="leaderboard-list animate-fade-in" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {leaderboard.map((item, index) => (
                            <div 
                                key={item.id} 
                                className={`rating-card ${item.id === user.id ? 'active-user' : ''}`}
                                style={{ 
                                    padding: '12px 16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px',
                                    backgroundColor: item.id === user.id ? 'rgba(255, 236, 139, 0.08)' : 'white',
                                    borderRadius: '18px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    border: item.id === user.id ? '2px solid var(--accent-yellow)' : '1px solid transparent'
                                }}
                            >
                                <span style={{ 
                                    fontWeight: '900', 
                                    fontSize: '16px', 
                                    width: '28px', 
                                    color: item.id === user.id ? 'var(--accent-yellow)' : '#999',
                                    textAlign: 'center'
                                }}>
                                    {index + 1}
                                </span>
                                <div style={{ 
                                    width: '44px', 
                                    height: '44px', 
                                    borderRadius: '50%', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#f0f0f0',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {item.profile_image ? (
                                        <img src={item.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={22} color="#ccc" />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '15px', color: item.id === user.id ? 'var(--bg-dark)' : '#333', fontWeight: 'bold' }}>
                                        {item.full_name} {item.id === user.id && t('you')}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{item.class_name || t('no_class')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--accent-yellow)' }}>
                                        <Star size={14} fill="currentColor" stroke="currentColor" /> {item.level}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                                        <Coins size={12} /> {item.coins}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <style sx>{`
                .rating-card {
                    transition: all 0.2s ease;
                }
                .active-user {
                    transform: scale(1.01);
                    box-shadow: 0 6px 15px rgba(255, 236, 139, 0.12) !important;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Leaderboard;
