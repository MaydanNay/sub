import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import TeacherRestriction from '../components/TeacherRestriction';

const CreateHomework = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    
    const [hwTitle, setHwTitle] = useState('');
    const [hwDesc, setHwDesc] = useState('');
    const [hwSteps, setHwSteps] = useState([]);
    const [isStar, setIsStar] = useState(false);
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);
    const [isMascotReward, setIsMascotReward] = useState(false);
    const [isDecomposing, setIsDecomposing] = useState(false);
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            try {
                const subsResp = await api.get('/subjects');
                
                // Use assigned subjects from the auth user object
                const teacherAssignedNames = user.assigned_subjects || [];
                const filtered = subsResp.data.filter(s => teacherAssignedNames.includes(s.name));
                
                setSubjects(filtered);
                if (filtered.length > 0) setSelectedSubject(filtered[0].id);
                else if (subsResp.data.length > 0) {
                    // Fallback to all subjects if filtered is empty for some reason
                    setSubjects(subsResp.data);
                    setSelectedSubject(subsResp.data[0].id);
                }
                
                // Use assigned classes from the auth user object
                const assigned = user.assigned_classes || [];
                setAssignedClasses(assigned);
                if (assigned.length > 0) setSelectedClass(assigned[0]);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchInitialData();
    }, [user]);

    const handleDecompose = async () => {
        if (!hwDesc) return;
        setIsDecomposing(true);
        try {
            const resp = await api.post('/homework/decompose', { description: hwDesc });
            setHwSteps(resp.data);
        } catch (err) {
            console.error("Decomposition failed", err);
            alert(t('error'));
        } finally {
            setIsDecomposing(false);
        }
    };

    const handleStepChange = (id, newText) => {
        setHwSteps(hwSteps.map(s => s.id === id ? { ...s, text: newText } : s));
    };

    const removeStep = (id) => {
        setHwSteps(hwSteps.filter(s => s.id !== id));
    };

    const addStep = () => {
        const nextId = hwSteps.length > 0 ? Math.max(...hwSteps.map(s => s.id)) + 1 : 1;
        setHwSteps([...hwSteps, { id: nextId, text: "" }]);
    };

    const handlePublishHW = async () => {
        if (!hwTitle || !hwDesc) return;
        setLoading(true);
        try {
            await api.post('/homework', {
                subject_id: selectedSubject,
                title: hwTitle,
                description: hwDesc,
                is_star: isStar,
                requires_confirmation: requiresConfirmation,
                is_mascot_reward: isMascotReward,
                class_name: selectedClass,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                steps: hwSteps.length > 0 ? hwSteps : null
            });
            alert(t('save'));
            navigate('/teacher/panel?view=hw');
        } catch (err) {
            console.error(err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    if (!user?.assigned_classes?.length || !user?.assigned_subjects?.length) {
        return <TeacherRestriction />;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <button 
                onClick={() => navigate('/teacher/panel?view=hw')} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer', 
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    opacity: 0.8
                }}
            >
                <ArrowLeft size={20} /> {t('back') || 'Назад'}
            </button>

            <div className="card animate-fade-in" style={{ padding: '25px' }}>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>{t('create_hw_title') || 'Создание домашнего задания'}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>{t('subject')}</label>
                        <select 
                            className="input-field" 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            style={{ background: '#f9f9f9' }}
                        >
                            {(subjects || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>{t('target_class') || 'Целевой класс'}</label>
                        <select 
                            className="input-field" 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ background: '#f9f9f9' }}
                        >
                            <option value="">{t('all_classes') || 'Все классы'}</option>
                            {(assignedClasses || []).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>{t('hw_title_placeholder') || 'Заголовок'}</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder={t('hw_title_placeholder')} 
                            value={hwTitle} 
                            onChange={(e) => setHwTitle(e.target.value)}
                            style={{ background: '#f9f9f9' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>{t('due_date')}</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={dueDate} 
                            onChange={(e) => setDueDate(e.target.value)}
                            style={{ background: '#f9f9f9' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>{t('hw_desc_placeholder') || 'Описание задания'}</label>
                        <textarea 
                            className="input-field" 
                            placeholder={t('hw_desc_placeholder')} 
                            value={hwDesc} 
                            onChange={(e) => setHwDesc(e.target.value)}
                            rows={4}
                            style={{ background: '#f9f9f9', resize: 'vertical' }}
                        />
                        <button 
                            className="btn-secondary" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                width: 'fit-content',
                                padding: '8px 16px',
                                background: 'var(--accent-yellow)',
                                color: 'black',
                                border: 'none',
                                opacity: isDecomposing ? 0.7 : 1
                            }} 
                            onClick={handleDecompose} 
                            disabled={isDecomposing}
                        >
                            <Sparkles size={16} /> {isDecomposing ? (t('thinking') || 'Думаю...') : (t('decompose_ai') || 'Разбить ИИ')}
                        </button>
                    </div>

                    {hwSteps.length > 0 && (
                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <h4 style={{ marginBottom: '12px', color: '#555', fontSize: '14px' }}>{t('steps_title') || 'Этапы выполнения'}:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(hwSteps || []).map((step, index) => (
                                    <div key={step.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#999', width: '20px' }}>{index + 1}.</span>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            style={{ padding: '8px 12px', fontSize: '14px', background: '#fff' }} 
                                            value={step.text}
                                            onChange={(e) => handleStepChange(step.id, e.target.value)}
                                        />
                                        <button 
                                            onClick={() => removeStep(step.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={addStep}
                                    style={{ 
                                        background: 'rgba(0,0,0,0.03)', 
                                        border: '2px dashed rgba(0,0,0,0.1)', 
                                        color: '#666', 
                                        fontSize: '13px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        gap: '8px', 
                                        cursor: 'pointer', 
                                        padding: '10px',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        marginTop: '5px'
                                    }}
                                >
                                    <Plus size={16} /> {t('add_step_manual')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="star" checked={isStar} onChange={(e) => setIsStar(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <label htmlFor="star" style={{ color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>{t('star_hw')}</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="confirm" checked={requiresConfirmation} onChange={(e) => setRequiresConfirmation(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <label htmlFor="confirm" style={{ color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>{t('photo_required')}</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="mascotReward" checked={isMascotReward} onChange={(e) => setIsMascotReward(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <label htmlFor="mascotReward" style={{ color: 'var(--parent-accent)', fontWeight: '800', cursor: 'pointer' }}>🎁 {t('mascot_reward_label') || 'Награда: Маскот'}</label>
                        </div>
                    </div>

                    <button 
                        className="btn-primary" 
                        style={{ 
                            width: '100%', 
                            padding: '15px', 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            marginTop: '10px',
                            background: 'var(--accent-green)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '16px'
                        }} 
                        onClick={handlePublishHW} 
                        disabled={loading}
                    >
                        {loading ? '...' : t('publish_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateHomework;
