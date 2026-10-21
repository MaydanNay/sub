import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Sparkles, ArrowLeft, Upload, X, Users, Award, Star } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const INTERNSHIP_TYPES = [
    { value: 'standard',   label: '📋 Стандартное',  desc: 'Обычное задание программы' },
    { value: 'creative',   label: '🎨 Творческое',   desc: 'Дизайн, контент, нестандартные идеи' },
    { value: 'analytical', label: '📊 Аналитическое', desc: 'Исследование, расчёты, анализ' },
    { value: 'team',       label: '🤝 Командное',    desc: 'Выполняется группой учеников' },
    { value: 'star',       label: '⭐ Со звёздочкой', desc: 'Сложное, необязательное, особое' },
];

const AUDIENCE_MODES = [
    { value: 'all_school',   label: '🏫 Вся школа' },
    { value: 'class',        label: '🎒 Конкретный класс' },
    { value: 'top5_school',  label: '🥇 Топ-5 школы' },
    { value: 'top5_class',   label: '🏆 Топ-5 класса' },
    { value: 'custom',       label: '✏️ Своя группа' },
];

const CreateInternship = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const staffRoles = ['teacher', 'admin', 'owner', 'super_admin', 'super_super_admin'];

    React.useEffect(() => {
        if (user && !staffRoles.includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    const [loading, setLoading]           = useState(false);
    const [subjects, setSubjects]         = useState([]);
    const [allClasses, setAllClasses]     = useState([]);
    const [allStudents, setAllStudents]   = useState([]);

    // Task fields
    const [title, setTitle]               = useState('');
    const [description, setDescription]  = useState('');
    const [internshipType, setType]       = useState('standard');
    const [hwSteps, setHwSteps]           = useState([]);
    const [selectedSubject, setSubject]   = useState('');
    const [dueDate, setDueDate]           = useState('');
    const [requiresConfirmation, setReqConf] = useState(true);
    const [isStar, setIsStar]             = useState(false);
    const [isDecomposing, setIsDecomposing] = useState(false);

    // Coins & prizes
    const [customCoins, setCustomCoins]   = useState(20);
    const [prizeFile, setPrizeFile]       = useState(null);
    const [prizeUrl, setPrizeUrl]         = useState('');
    const [uploadingPrize, setUploadingPrize] = useState(false);
    const fileRef = useRef();

    // Audience targeting
    const [audienceMode, setAudienceMode] = useState('all_school');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const [subsResp, usersResp] = await Promise.all([
                    api.get('/subjects'),
                    api.get('/admin/users'),
                ]);
                setSubjects(subsResp.data);
                if (subsResp.data.length) setSubject(subsResp.data[0].id);

                const students = usersResp.data.filter(u => u.role === 'student');
                setAllStudents(students);
                const classes = [...new Set(students.filter(s => s.class_name).map(s => s.class_name))].sort();
                setAllClasses(classes);
                if (classes.length) setSelectedClass(classes[0]);
            } catch (err) {
                console.error('Init error', err);
            }
        })();
    }, []);

    // Auto-set isStar if type === star
    useEffect(() => {
        setIsStar(internshipType === 'star');
    }, [internshipType]);

    const handleDecompose = async () => {
        if (!description) return;
        setIsDecomposing(true);
        try {
            const resp = await api.post('/homework/decompose', { description });
            setHwSteps(resp.data);
        } catch { 
            alert('Ошибка разбивки'); 
        } finally { 
            setIsDecomposing(false); 
        }
    };

    const addStep = () => {
        const nextId = hwSteps.length ? Math.max(...hwSteps.map(s => s.id)) + 1 : 1;
        setHwSteps([...hwSteps, { id: nextId, text: '' }]);
    };

    const handlePrizeUpload = async (file) => {
        if (!file) return;
        setUploadingPrize(true);
        const form = new FormData();
        form.append('file', file);
        try {
            const resp = await api.post('/homework/upload-proof', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPrizeUrl(resp.data.attachment_url);
            setPrizeFile(file);
        } catch {
            alert('Ошибка загрузки файла');
        } finally {
            setUploadingPrize(false);
        }
    };

    const buildTargetAudience = () => {
        if (audienceMode === 'all_school') return { mode: 'all_school' };
        if (audienceMode === 'class') return { mode: 'class', class_name: selectedClass };
        if (audienceMode === 'top5_school') return { mode: 'top5_school' };
        if (audienceMode === 'top5_class') return { mode: 'top5_class', class_name: selectedClass };
        if (audienceMode === 'custom') return { mode: 'custom', student_ids: selectedStudents };
        return { mode: 'all_school' };
    };

    const handlePublish = async () => {
        if (!title || !description) return alert('Заполни название и описание');
        setLoading(true);
        try {
            const audience = buildTargetAudience();
            await api.post('/internships', {
                subject_id: parseInt(selectedSubject),
                title,
                description,
                is_star: isStar,
                requires_confirmation: requiresConfirmation,
                is_mascot_reward: false,
                class_name: audienceMode === 'class' || audienceMode === 'top5_class' ? selectedClass : null,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                steps: hwSteps.length ? hwSteps : null,
                is_internship: true,
                internship_type: internshipType,
                custom_coin_reward: customCoins,
                prize_attachment_url: prizeUrl || null,
                target_audience: audience,
            });
            alert('Стажировка опубликована! ✅');
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert('Ошибка публикации: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = allStudents.filter(s =>
        s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.username.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', maxWidth: '760px', margin: '0 auto', paddingBottom: '120px' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', opacity: 0.8 }}
            >
                <ArrowLeft size={20} /> Назад
            </button>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🌟 Создать стажировку
                </h1>
                <p style={{ margin: '6px 0 0', color: '#888', fontSize: '13px' }}>
                    Задания появятся у учеников в разделе «Домашние задания» с меткой стажировки
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Type Selector */}
                <div className="intern-card">
                    <label className="intern-label">Тип стажировки</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        {INTERNSHIP_TYPES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setType(t.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '14px',
                                    border: internshipType === t.value ? '2px solid var(--accent-yellow)' : '2px solid rgba(255,255,255,0.07)',
                                    background: internshipType === t.value ? 'rgba(255,236,139,0.08)' : '#1a1a1a',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '13px' }}>{t.label}</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>{t.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="intern-card">
                    <label className="intern-label">Предмет / тема</label>
                    <select
                        className="intern-input"
                        value={selectedSubject}
                        onChange={e => setSubject(e.target.value)}
                    >
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <label className="intern-label" style={{ marginTop: '16px' }}>Название задания</label>
                    <input
                        className="intern-input"
                        type="text"
                        placeholder="Например: Разработать логотип проекта"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />

                    <label className="intern-label" style={{ marginTop: '16px' }}>Дедлайн</label>
                    <input
                        className="intern-input"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                    />

                    <label className="intern-label" style={{ marginTop: '16px' }}>Описание задания</label>
                    <textarea
                        className="intern-input"
                        rows={4}
                        placeholder="Опиши что нужно сделать, требования, формат сдачи..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ resize: 'vertical' }}
                    />
                    <button
                        onClick={handleDecompose}
                        disabled={isDecomposing || !description}
                        style={{
                            marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,236,139,0.1)', border: '1px solid rgba(255,236,139,0.3)',
                            color: '#FFEC8B', borderRadius: '12px', padding: '8px 14px',
                            cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                            opacity: isDecomposing ? 0.6 : 1
                        }}
                    >
                        <Sparkles size={15} /> {isDecomposing ? 'ИИ думает...' : 'Разбить на шаги (ИИ)'}
                    </button>
                </div>

                {/* Steps */}
                {hwSteps.length > 0 && (
                    <div className="intern-card">
                        <label className="intern-label">Этапы выполнения</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            {hwSteps.map((step, i) => (
                                <div key={step.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ color: '#555', fontSize: '12px', fontWeight: 700, width: '18px' }}>{i + 1}.</span>
                                    <input
                                        className="intern-input"
                                        style={{ flex: 1, padding: '8px 12px' }}
                                        value={step.text}
                                        onChange={e => setHwSteps(hwSteps.map(s => s.id === step.id ? { ...s, text: e.target.value } : s))}
                                    />
                                    <button onClick={() => setHwSteps(hwSteps.filter(s => s.id !== step.id))}
                                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addStep}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', color: '#666', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                                <Plus size={15} /> Добавить шаг вручную
                            </button>
                        </div>
                    </div>
                )}

                {/* Coins & Prize */}
                <div className="intern-card">
                    <label className="intern-label"><Award size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />Вознаграждение</label>

                    <div style={{ marginTop: '12px' }}>
                        <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Монеты за выполнение</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="range" min="5" max="500" step="5"
                                value={customCoins}
                                onChange={e => setCustomCoins(parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span style={{ fontWeight: 900, fontSize: '22px', color: '#FFEC8B', minWidth: '60px', textAlign: 'right' }}>
                                💰 {customCoins}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '18px' }}>
                        <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px' }}>
                            Дополнительный приз (изображение, PDF, документ, нашивка...)
                        </label>
                        {prizeFile ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,236,139,0.2)' }}>
                                <span style={{ fontSize: '22px' }}>
                                    {prizeFile.type.startsWith('image') ? '🖼️' : prizeFile.type === 'application/pdf' ? '📄' : '📎'}
                                </span>
                                <span style={{ flex: 1, fontSize: '13px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {prizeFile.name}
                                </span>
                                <button onClick={() => { setPrizeFile(null); setPrizeUrl(''); }}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploadingPrize}
                                style={{ width: '100%', background: '#1a1a1a', border: '2px dashed rgba(255,255,255,0.1)', color: '#888', borderRadius: '14px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, fontSize: '13px' }}
                            >
                                <Upload size={16} /> {uploadingPrize ? 'Загружается...' : 'Прикрепить приз'}
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileRef}
                            accept="image/*,.pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={e => e.target.files[0] && handlePrizeUpload(e.target.files[0])}
                        />
                    </div>
                </div>

                {/* Audience */}
                <div className="intern-card">
                    <label className="intern-label"><Users size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />Получатели задания</label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        {AUDIENCE_MODES.map(m => (
                            <button key={m.value} onClick={() => setAudienceMode(m.value)}
                                style={{
                                    padding: '10px 12px', borderRadius: '12px',
                                    border: audienceMode === m.value ? '2px solid var(--accent-yellow)' : '2px solid rgba(255,255,255,0.07)',
                                    background: audienceMode === m.value ? 'rgba(255,236,139,0.08)' : '#1a1a1a',
                                    color: audienceMode === m.value ? 'white' : '#888',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '12px', textAlign: 'left'
                                }}>
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {(audienceMode === 'class' || audienceMode === 'top5_class') && (
                        <div style={{ marginTop: '14px' }}>
                            <label style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>Выберите класс</label>
                            <select className="intern-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {audienceMode === 'custom' && (
                        <div style={{ marginTop: '14px' }}>
                            <label style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>
                                Выберите учеников ({selectedStudents.length} выбрано)
                            </label>
                            <input
                                className="intern-input"
                                type="text"
                                placeholder="Поиск по имени..."
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                style={{ marginBottom: '8px' }}
                            />
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {filteredStudents.map(s => {
                                    const selected = selectedStudents.includes(s.id);
                                    return (
                                        <label key={s.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                                            borderRadius: '10px', cursor: 'pointer',
                                            background: selected ? 'rgba(255,236,139,0.07)' : 'transparent',
                                            border: selected ? '1px solid rgba(255,236,139,0.2)' : '1px solid transparent'
                                        }}>
                                            <input type="checkbox" checked={selected}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                                                    else setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                                                }} />
                                            <span style={{ flex: 1, fontSize: '13px', color: 'white' }}>{s.full_name}</span>
                                            <span style={{ fontSize: '11px', color: '#555' }}>{s.class_name || '—'}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Options */}
                <div className="intern-card">
                    <label className="intern-label">Опции</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={requiresConfirmation} onChange={e => setReqConf(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>📎 Требовать прикрепление файла/фото</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={isStar} onChange={e => setIsStar(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <span style={{ color: '#FFEC8B', fontWeight: 700, fontSize: '13px' }}>⭐ Звёздное задание (необязательное, бонусное)</span>
                        </label>
                    </div>
                </div>

                {/* Publish */}
                <button
                    onClick={handlePublish}
                    disabled={loading || !title || !description}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '18px', border: 'none',
                        background: loading ? '#333' : 'linear-gradient(135deg, #FFEC8B, #FFB800)',
                        color: '#111', fontWeight: 900, fontSize: '16px', cursor: 'pointer',
                        transition: 'all 0.2s', opacity: (!title || !description) ? 0.5 : 1
                    }}
                >
                    {loading ? '⏳ Публикация...' : '🚀 Опубликовать стажировку'}
                </button>
            </div>

            <style>{`
                .intern-card {
                    background: #161616;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 20px;
                }
                .intern-label {
                    font-size: 13px;
                    font-weight: 800;
                    color: #ccc;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    display: block;
                }
                .intern-input {
                    width: 100%;
                    background: #222;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 11px 14px;
                    color: white;
                    font-family: inherit;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .intern-input:focus {
                    border-color: rgba(255,236,139,0.4);
                }
                .intern-input option {
                    background: #222;
                }
            `}</style>
        </div>
    );
};

export default CreateInternship;
