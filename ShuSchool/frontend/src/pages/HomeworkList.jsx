import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Star, Camera, Award } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const HomeworkList = () => {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState({});
    const [activeTab, setActiveTab] = useState('all'); // all, not_done, done, internship
    const [hwData, setHwData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState({});

    const INTERNSHIP_TYPE_LABELS = {
        standard:   '📋 Стандартное',
        creative:   '🎨 Творческое',
        analytical: '📊 Аналитическое',
        team:       '🤝 Командное',
        star:       '⭐ Звёздное',
    };

    useEffect(() => {
        const fetchHomework = async () => {
            try {
                // Fetching all assignments, auth is handled by the API interceptor
                const response = await api.get('/homework');
                const processed = response.data.map(hw => ({
                    ...hw,
                    subject: hw.subject_id === 1 ? t('math_subject') : t('subject_prefix') + hw.subject_id,
                    isPending: hw.is_pending,
                    isCompleted: hw.is_completed,
                    steps: hw.steps.map(s => ({ 
                        ...s, 
                        completed: hw.is_completed || hw.completed_steps.includes(s.id) 
                    }))
                }));
                setHwData(processed);

                // Expand all by default
                const exp = {};
                processed.forEach(hw => { exp[hw.id] = true; });
                setExpanded(exp);

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch homework:", err);
                setLoading(false);
            }
        };

        fetchHomework();
    }, []);

    const toggleStep = (hwId, stepId) => {
        setHwData(prev => prev.map(hw => {
            if (hw.id === hwId) {
                return {
                    ...hw,
                    steps: hw.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
                };
            }
            return hw;
        }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const handleFileChange = (hwId, e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachments(prev => ({ ...prev, [hwId]: file }));
        }
    };

    const renderStatus = (hw) => {
        let text = t('not_started');
        let bgColor = '#ef4444';
        let textColor = 'white';
        let icon = null;

        if (hw.isCompleted) {
            text = t('status_approved');
            bgColor = 'var(--accent-green)';
            textColor = '#121212';
        } else if (hw.isPending) {
            text = t('status_pending');
            bgColor = '#FFB300';
            textColor = '#000';
            icon = '⌛ ';
        } else if (hw.steps.some(s => s.completed)) {
            text = t('in_progress');
            bgColor = '#3b82f6';
            textColor = 'white';
        }

        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '900',
                backgroundColor: bgColor,
                color: textColor,
                textTransform: 'uppercase',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
                {icon}{text}
            </div>
        );
    };

    const handleSubmit = async (hwId) => {
        const hw = hwData.find(h => h.id === hwId);
        if (!hw) return;

        const completedSteps = hw.steps.filter(s => s.completed).map(s => s.id);
        
        let attachmentUrl = null;
        if (hw.requires_confirmation) {
            const file = attachments[hwId];
            if (!file) {
                alert(t("please_attach_photo"));
                return;
            }

            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const uploadResp = await api.post('/homework/upload-proof', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                attachmentUrl = uploadResp.data.attachment_url;
            } catch (err) {
                console.error("Upload failed", err);
                alert(t("upload_error"));
                setUploading(false);
                return;
            }
        }

        try {
            await api.post('/homework/submit', {
                homework_id: hwId,
                completed_steps: completedSteps,
                attachment_url: attachmentUrl
            });
            
            setHwData(prev => prev.map(h => 
                h.id === hwId ? { ...h, isPending: true } : h
            ));
        } catch (err) {
            console.error("Failed to submit homework:", err);
        } finally {
            setUploading(false);
        }
    };

    const filteredHw = hwData.filter(hw => {
        if (activeTab === 'game') return false; // Games aren't implemented yet
        if (activeTab === 'internship') return hw.is_internship;
        if (activeTab === 'homework') return !hw.is_internship;
        if (activeTab === 'all') return true;
        if (activeTab === 'not_done') return !hw.isPending && !hw.isCompleted;
        if (activeTab === 'done') return hw.isPending || hw.isCompleted;
        return true;
    });

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>{t('loading')}...</div>;

    return (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div className="tabs-nav animate-fade-in" style={{ 
                display: 'flex', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '5px', 
                borderRadius: '15px', 
                marginBottom: '35px',
                position: 'sticky',
                top: '20px',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                gap: '4px'
            }}>
                <button 
                    className={`nav-tab ${activeTab === 'homework' || activeTab === 'all' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('homework')}
                >
                    {t('tab_homework')}
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'internship' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('internship')}
                >
                    {t('tab_internship')}
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'game' ? 'active' : ''}`} 
                    style={{ position: 'relative', opacity: 0.6 }}
                    onClick={() => setActiveTab('game')}
                >
                    {t('tab_game')}
                    <span style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '-5px', 
                        fontSize: '9px', 
                        background: 'var(--accent-yellow)', 
                        color: 'black', 
                        padding: '2px 6px', 
                        borderRadius: '8px',
                        fontWeight: '900',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {t('coming_soon')}
                    </span>
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
                {filteredHw.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-gray)' }}>
                        <p style={{ fontSize: '18px', fontWeight: '700' }}>
                            {activeTab === 'not_done' ? t('all_done') : (activeTab === 'done' ? t('empty_done') : t('no_homework'))}
                        </p>
                    </div>
                ) : (
                    filteredHw.map(hw => (
                        <div key={hw.id} className="card animate-fade-in" style={{
                            padding: '25px',
                            opacity: hw.isCompleted ? 0.8 : 1,
                            border: hw.is_internship ? '1px solid rgba(255,236,139,0.25)' : undefined,
                            background: hw.is_internship ? 'linear-gradient(135deg, rgba(255,236,139,0.04), transparent)' : undefined
                        }}>
                            {/* Internship header badge */}
                            {hw.is_internship && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFEC8B', background: 'rgba(255,236,139,0.12)', border: '1px solid rgba(255,236,139,0.25)', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                                        🌟 СТАЖИРОВКА
                                    </span>
                                    {hw.internship_type && (
                                        <span style={{ fontSize: '11px', color: '#888' }}>
                                            {INTERNSHIP_TYPE_LABELS[hw.internship_type] || hw.internship_type}
                                        </span>
                                    )}
                                    {hw.custom_coin_reward && (
                                        <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#FFEC8B', fontSize: '13px' }}>
                                            💰 {hw.custom_coin_reward}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setExpanded(prev => ({ ...prev, [hw.id]: !prev[hw.id] }))}
                            >
                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-gray)', textTransform: 'uppercase' }}>{hw.subject}</span>
                                    <h3 style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {hw.is_star && <Star size={16} fill="gold" stroke="gold" />}
                                        {hw.title}
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {hw.due_date && (
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                            до {formatDate(hw.due_date)}
                                        </div>
                                    )}
                                    {renderStatus(hw)}
                                    <div style={{ color: 'var(--text-gray)' }}>
                                        {expanded[hw.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expanded[hw.id] && (
                                <div className="steps-container" style={{ marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '15px' }}>
                                    {hw.steps.map(step => (
                                        <div 
                                            key={step.id} 
                                            className="step-row"
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px', 
                                                padding: '12px 15px', 
                                                borderRadius: '15px',
                                                cursor: hw.isPending || hw.isCompleted ? 'default' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                marginBottom: '5px'
                                            }}
                                            onClick={() => !hw.isPending && !hw.isCompleted && toggleStep(hw.id, step.id)}
                                        >
                                            <div style={{
                                                // width: '24px',
                                                // height: '24px',
                                                borderRadius: '50%',
                                                border: step.completed ? 'none' : '2px solid rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: step.completed ? 'var(--accent-green)' : 'transparent',
                                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                transform: step.completed ? 'scale(1.1)' : 'scale(1)'
                                            }}>
                                                <CheckCircle 
                                                    size={18} 
                                                    color={step.completed ? '#fff' : 'transparent'} 
                                                />
                                            </div>
                                            <span style={{ 
                                                fontSize: '15px', 
                                                fontWeight: '500',
                                                textDecoration: step.completed ? 'line-through' : 'none',
                                                color: step.completed ? 'var(--text-gray)' : 'var(--text-dark)'
                                            }}>
                                                {step.text}
                                            </span>
                                        </div>
                                    ))}

                                    {hw.requires_confirmation && !hw.isPending && !hw.isCompleted && (
                                        <div style={{ margin: '15px 0', padding: '15px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px dashed #ccc' }}>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{t('photo_required')}</p>
                                            <input 
                                                type="file" 
                                                id={`file-${hw.id}`} 
                                                style={{ display: 'none' }} 
                                                onChange={(e) => handleFileChange(hw.id, e)}
                                                accept="image/*"
                                            />
                                            <button 
                                                onClick={() => document.getElementById(`file-${hw.id}`).click()}
                                                className="btn-secondary"
                                                style={{ width: '100%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                                            >
                                                <Camera size={16} /> {attachments[hw.id] ? attachments[hw.id].name : t('choose_photo')}
                                            </button>
                                        </div>
                                    )}

                                    <button 
                                        className="btn-primary" 
                                        style={{ 
                                            width: '100%', 
                                            marginTop: '10px', 
                                            fontSize: '14px',
                                            backgroundColor: hw.isCompleted ? '#4ade80' : (hw.isPending ? '#fcd34d' : 'var(--accent-green)'),
                                            opacity: (hw.isCompleted || hw.isPending || (hw.steps.every(s => s.completed) && (!hw.requires_confirmation || attachments[hw.id]))) ? 1 : 0.5,
                                            color: hw.isPending ? '#000' : 'inherit'
                                        }}
                                        onClick={() => !hw.isPending && !hw.isCompleted && !uploading && handleSubmit(hw.id)}
                                        disabled={hw.isPending || hw.isCompleted || uploading}
                                    >
                                        {uploading ? t('uploading') : (hw.isCompleted ? t('status_approved') : (hw.isPending ? t('status_pending') : t('send_for_review')))}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .nav-tab {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.6);
                    font-weight: 700;
                    font-size: 13px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .nav-tab.active {
                    background: var(--accent-yellow);
                    color: #000;
                    box-shadow: 0 4px 10px rgba(255, 236, 139, 0.3);
                }
                .step-row:hover {
                    background: rgba(0,0,0,0.03);
                }
                .step-row:active {
                    transform: scale(0.99);
                }
            `}</style>
        </div>
    );
};

export default HomeworkList;
