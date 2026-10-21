import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, UserMinus, ShieldAlert, Award, Trophy, Flame, Book } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import TeacherRestriction from '../components/TeacherRestriction';
import Avatar from '../components/Avatar';

const Classes = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [behaviorModal, setBehaviorModal] = useState({ open: false, studentId: null, type: 'praise' });
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    
    const selectedClass = searchParams.get('class');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/teacher/classes?scope=assigned');
                setClasses(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch classes:", err);
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                setLoadingStudents(true);
                try {
                    const response = await api.get(`/teacher/classes/${selectedClass}/students`);
                    setStudents(response.data);
                } catch (err) {
                    console.error("Failed to fetch students:", err);
                } finally {
                    setLoadingStudents(false);
                }
            };
            fetchStudents();
        }
    }, [selectedClass]);

    const submitBehavior = async () => {
        if (!behaviorModal.studentId) return;
        setSubmitting(true);
        try {
            const isPenalty = behaviorModal.type === 'penalty';
            await api.post('/behavior', {
                user_id: behaviorModal.studentId,
                type: isPenalty ? 'discipline' : 'praise',
                coin_penalty: isPenalty ? 5 : -5,
                description: comment || (isPenalty ? t('discipline_violation') : t('lesson_activity'))
            });
            alert(isPenalty ? t('penalty_applied_alert') : t('bonus_applied_alert'));
            setBehaviorModal({ open: false, studentId: null, type: 'praise' });
            setComment("");
            if (selectedClass) {
                const response = await api.get(`/teacher/classes/${selectedClass}/students`);
                setStudents(response.data);
            }
        } catch (err) {
            console.error(err);
            alert(t('writing_error_alert'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{padding: '40px', textAlign: 'center', color: 'white'}}>{t('loading_classes')}</div>;

    if (!user?.assigned_classes?.length || !user?.assigned_subjects?.length) {
        return <TeacherRestriction />;
    }

    return (
        <div style={{ padding: '20px' }}>
            {!selectedClass ? (
                <>
                    <Link 
                        to="/teacher/leaderboard" 
                        className="btn-secondary" 
                        style={{ marginBottom: '20px', width: '100%', justifyContent: 'center', background: 'var(--glass)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
                    >
                        <Trophy size={18} color="var(--accent-yellow)" /> {t('view_general_leaderboard')}
                    </Link>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {classes.length === 0 ? (
                        <p style={{ color: '#888', gridColumn: 'span 2' }}>{t('classes_not_found')}</p>
                    ) : (
                        classes.map(c => (
                            <div 
                                key={c} 
                                className="card animate-fade-in" 
                                style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => setSearchParams({ class: c })}
                            >
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏫</div>
                                <h3 style={{ color: 'var(--text-dark)' }}>{c}</h3>
                                <p style={{ fontSize: '12px', color: '#888' }}>{t('manage_composition')}</p>
                            </div>
                        ))
                    )}
                    </div>
                </>
            ) : (
                <div className="animate-fade-in">
                    
                    {loadingStudents ? (
                        <p style={{ color: 'white' }}>{t('loading_students')}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {students.map(s => (
                                <div key={s.id} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <Link to={`/teacher/profile/${s.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <Avatar user={s} size={50} />
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    bottom: '-4px', 
                                                    right: '-4px', 
                                                    backgroundColor: '#222', 
                                                    color: 'white', 
                                                    width: '22px', 
                                                    height: '22px', 
                                                    borderRadius: '50%', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    fontSize: '10px', 
                                                    fontWeight: '900',
                                                    border: '2px solid white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    {s.level || 1}
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '15px', marginBottom: '2px' }}>{s.full_name}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <p style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>{s.coins ?? 0} 🪙</p>
                                                    {/* Streaks Display */}
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {s.streaks?.attendance > 0 && (
                                                            <div title={t('attendance_streak_tooltip')} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255, 107, 107, 0.15)', padding: '2px 6px', borderRadius: '8px', fontSize: '11px', color: '#ff6b6b', fontWeight: 'bold' }}>
                                                                <Flame size={12} /> {s.streaks.attendance}
                                                            </div>
                                                        )}
                                                        {s.streaks?.homework > 0 && (
                                                            <div title={t('homework_streak_tooltip')} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(74, 144, 226, 0.15)', padding: '2px 6px', borderRadius: '8px', fontSize: '11px', color: '#4a90e2', fontWeight: 'bold' }}>
                                                                <Book size={12} /> {s.streaks.homework}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="circle-btn warn" 
                                            onClick={() => setBehaviorModal({ open: true, studentId: s.id, type: 'penalty' })}
                                            title={t('behavior_penalty_title')}
                                        >
                                            <ShieldAlert size={18} />
                                        </button>
                                        <button 
                                            className="circle-btn praise" 
                                            onClick={() => setBehaviorModal({ open: true, studentId: s.id, type: 'praise' })}
                                            title={t('praise_student_title')}
                                        >
                                            <Award size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Behavior Modal */}
            {behaviorModal.open && (
                <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setBehaviorModal({ ...behaviorModal, open: false })}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '30px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ background: behaviorModal.type === 'penalty' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(40, 199, 111, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                {behaviorModal.type === 'penalty' ? <ShieldAlert size={32} color="#ff4d4d" /> : <Award size={32} color="#28c76f" />}
                            </div>
                            <h3 style={{ color: 'white', margin: 0 }}>{behaviorModal.type === 'penalty' ? t('behavior_penalty_title') : t('praise_student_title')}</h3>
                            <p style={{ color: '#888', marginTop: '8px' }}>
                                {behaviorModal.type === 'penalty' ? t('penalty_coins_desc') : t('bonus_coins_desc')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('comment_reason_label')}</label>
                            <textarea 
                                className="input-field" 
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', minHeight: '100px', resize: 'none' }}
                                placeholder={behaviorModal.type === 'penalty' ? t('comment_penalty_placeholder') : t('comment_praise_placeholder')}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn-secondary" 
                                style={{ flex: 1, color: 'white', background: 'rgba(255,255,255,0.05)' }} 
                                onClick={() => setBehaviorModal({ ...behaviorModal, open: false })}
                            >{t('cancel')}</button>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 2, background: behaviorModal.type === 'penalty' ? '#ff4d4d' : 'var(--accent-green)' }} 
                                onClick={submitBehavior}
                                disabled={submitting}
                            >
                                {submitting ? "..." : (behaviorModal.type === 'penalty' ? t('punish_btn') : t('praise_btn'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .circle-btn {
                    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center;
                }
                .circle-btn.warn { background-color: #ff4d4d; }
                .circle-btn.praise { background-color: var(--accent-green); }
            `}</style>
        </div>
    );
};

export default Classes;
