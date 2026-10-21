import React, { useState, useEffect } from 'react';
import { Check, UserMinus, UserPlus, Zap, Trash2, Plus, Sparkles, PlusCircle, BarChart3, Filter, X, History, Clock, Users, BookOpen, AlertCircle, ShieldAlert, Lock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import TeacherRestriction from '../components/TeacherRestriction';
import api from '../api';

const TeacherPanel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('view') || 'lessons';
    const [view, setView] = useState(initialView); 
    const { t } = useLanguage(); 
    const { user } = useAuth();
    
    // Sync state with URL changes
    useEffect(() => {
        const currentView = searchParams.get('view');
        if (currentView && currentView !== view) {
            setView(currentView);
        }
    }, [searchParams]);

    const handleViewChange = (newView) => {
        setView(newView);
        setSearchParams({ view: newView });
    };

    const [scope, setScope] = useState('assigned'); // Default to assigned/mine
    const [showQR, setShowQR] = useState(false);
    const [lessonId, setLessonId] = useState('');
    const [lessonTopic, setLessonTopic] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [lessonHwId, setLessonHwId] = useState('');
    const [notifyStudents, setNotifyStudents] = useState(true);
    const [isAttachingHW, setIsAttachingHW] = useState(false);
    const [selectedHWForLesson, setSelectedHWForLesson] = useState('');
    const [startingLesson, setStartingLesson] = useState(false);
    const [dueDate, setDueDate] = useState('');
    
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hwTitle, setHwTitle] = useState('');
    const [hwDesc, setHwDesc] = useState('');
    const [isStar, setIsStar] = useState(false);
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);
    const [isMascotReward, setIsMascotReward] = useState(false);
    const [myHomeworks, setMyHomeworks] = useState([]);
    const [hwFilterClass, setHwFilterClass] = useState('');
    const [selectedHwStats, setSelectedHwStats] = useState(null);
    

    
    const [classes, setClasses] = useState([]);
    const [classStudents, setClassStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    // Grading state
    const [studentGrades, setStudentGrades] = useState({}); // {studentId: score}
    const [gradeCategory, setGradeCategory] = useState('classwork');
    const [gradeComment, setGradeComment] = useState('');
    const [gradeLessonId, setGradeLessonId] = useState('');
    
    // Homework Review grading state
    const [submissionGrades, setSubmissionGrades] = useState({}); // {subId: score}
    
    // Scanned students
    const [scannedStudents, setScannedStudents] = useState([]);

    const [lessons, setLessons] = useState([]);
    const [selectedLessonDetail, setSelectedLessonDetail] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Pending Approvals (for Teachers)
    const [pendingStudents, setPendingStudents] = useState([]);

    // AI HW Steps State
    const [hwSteps, setHwSteps] = useState([]);
    const [isDecomposing, setIsDecomposing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesResp, subsResp, subjResp, hwResp, lessonsResp] = await Promise.all([
                    api.get(`/teacher/classes?scope=${scope}`),
                    api.get(`/teacher/submissions?scope=${scope}`),
                    api.get('/subjects'),
                    api.get('/teacher/my-homeworks'),
                    api.get('/teacher/lessons')
                ]);
                setClasses(classesResp.data);
                setSubmissions(subsResp.data);
                setSubjects(subjResp.data);
                setMyHomeworks(hwResp.data);
                setLessons(lessonsResp.data);
                if (subjResp.data.length > 0 && !selectedSubject) setSelectedSubject(subjResp.data[0].id);
                
                // Clear selected class if no longer valid under new scope
                if (selectedClass && !classesResp.data.includes(selectedClass)) {
                    setSelectedClass('');
                }

                // If teacher, fetch pending students
                if (user.role === 'teacher') {
                    api.get('/admin/pending-staff').then(res => setPendingStudents(res.data)).catch(console.error);
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchData();
    }, [scope, user]);

    // Polling for scanned students when lesson is active
    useEffect(() => {
        let interval;
        if (showQR) {
            const fetchScanned = async () => {
                try {
                    const resp = await api.get(`/attendance/lesson/${lessonId}/scanned`);
                    setScannedStudents(resp.data);
                } catch (err) {
                    console.error("Failed to poll scanned students", err);
                }
            };
            fetchScanned();
            interval = setInterval(fetchScanned, 5000); // every 5 seconds
        }
        return () => clearInterval(interval);
    }, [showQR, lessonId]);

    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                try {
                    const resp = await api.get(`/teacher/classes/${selectedClass}/students`);
                    setClassStudents(resp.data);
                } catch (err) {
                    console.error("Failed to fetch students", err);
                }
            };
            fetchStudents();
        }
    }, [selectedClass]);

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

    const fetchLessonDetail = async (lessonIdStr) => {
        console.log("Fetching detail for:", lessonIdStr);
        if (!lessonIdStr) return;
        setLoading(true);
        try {
            const resp = await api.get(`/teacher/lessons/${lessonIdStr}`);
            setSelectedLessonDetail(resp.data);
            setIsAttachingHW(false); // Reset HW attachment state when opening new lesson
        } catch (err) {
            console.error("Failed to fetch lesson detail", err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAttachHomework = async () => {
        if (!selectedHWForLesson) return;
        try {
            await api.post('/teacher/lessons/attach-homework', {
                lesson_id_str: selectedLessonDetail.lesson_id_str,
                homework_id: Number(selectedHWForLesson)
            });
            fetchLessonDetail(selectedLessonDetail.lesson_id_str);
            setIsAttachingHW(false);
        } catch (err) {
            console.error("Failed to attach homework", err);
            alert(t('error'));
        }
    };

    const handleDeleteHW = async (hwId) => {
        if (!window.confirm(t('confirm_delete') || 'Вы уверены?')) return;
        setLoading(true);
        try {
            await api.delete(`/homework/${hwId}`);
            setMyHomeworks(myHomeworks.filter(h => h.id !== hwId));
        } catch (err) {
            console.error(err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchHwStats = async (hwId) => {
        setLoading(true);
        try {
            const resp = await api.get(`/teacher/homework/${hwId}/stats`);
            setSelectedHwStats(resp.data);
        } catch (err) {
            console.error(err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };



    const handleApproveHW = async (subId) => {
        setLoading(true);
        try {
            await api.post('/homework/approve', {
                submission_id: subId,
                bonus_coins: 5,
                score: submissionGrades[subId] ? parseInt(submissionGrades[subId]) : null
            });
            setSubmissions(submissions.filter(s => s.id !== subId));
            setSubmissionGrades(prev => {
                const n = {...prev};
                delete n[subId];
                return n;
            });
            alert(t('save'));
        } catch (err) {
            console.error(err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrades = async () => {
        const gradeList = Object.entries(studentGrades).map(([sid, score]) => ({
            user_id: parseInt(sid),
            subject_id: parseInt(selectedSubject),
            score: parseInt(score),
            lesson_id: gradeLessonId ? parseInt(gradeLessonId) : null,
            grade_type: gradeCategory,
            comment: gradeComment
        }));
        if (gradeList.length === 0) {
            alert("Сначала выставьте оценки");
            return;
        }
        setLoading(true);
        try {
            await api.post('/teacher/grades', gradeList);
            alert(t('grading_success').replace('{count}', gradeList.length));
            setStudentGrades({});
            setGradeComment('');
        } catch (err) {
            console.error(err);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleManualAttendance = async (studentId) => {
        try {
            await api.post('/attendance/manual', null, {
                params: { user_id: studentId, lesson_id: lessonId }
            });
            setScannedStudents(prev => [...prev, { id: studentId, full_name: "..." }]);
        } catch (err) {
            console.error(err);
            alert(t('error'));
        }
    };

    const handleStartLesson = async () => {
        if (!selectedSubject) {
            alert("Пожалуйста, выберите предмет");
            return;
        }
        setStartingLesson(true);
        try {
            const resp = await api.post('/teacher/start-lesson', {
                subject_id: Number(selectedSubject),
                class_name: selectedClass || null,
                topic: lessonTopic,
                homework_id: lessonHwId ? Number(lessonHwId) : null,
                notify_students: notifyStudents
            });
            setLessonId(resp.data.lesson_id);
            setShowQR(true);
            
            // Refresh lessons list immediately to show the active lesson banner/item
            const lessonsResp = await api.get('/teacher/lessons');
            setLessons(lessonsResp.data);
        } catch (err) {
            console.error("Failed to start lesson:", err);
            alert(t('error') || "Ошибка при запуске урока");
        } finally {
            setStartingLesson(false);
        }
    };

    const handleFinishLesson = async (lId, lClass, lSubj) => {
        const targetId = lId || lessonId;
        const targetClass = lClass || selectedClass;
        const targetSubj = lSubj || Number(selectedSubject);

        try {
            await api.post('/teacher/finish-lesson', {
                lesson_id: targetId,
                class_name: targetClass || null,
                subject_id: targetSubj
            });
            if (targetId === lessonId) {
                setShowQR(false);
                setShowCreateModal(false);
                setLessonId(''); // Clear immediate active lesson state
            }
            // Refresh list
            const resp = await api.get('/teacher/lessons');
            setLessons(resp.data);
        } catch (err) {
            console.error("Failed to finish lesson", err);
            setShowQR(false);
            setShowCreateModal(false);
        }
    };

    const handleOpenQRHistory = (l) => {
        setLessonId(l.lesson_id_str);
        setLessonTopic(l.topic || '');
        setSelectedClass(l.class_name || '');
        setSelectedSubject(l.subject_id);
        setShowQR(true);
        setShowCreateModal(true);
    };

    const handleApproveStudent = async (studentId) => {
        try {
            await api.post(`/admin/users/${studentId}/approve`);
            setPendingStudents(pendingStudents.filter(s => s.id !== studentId));
            alert(t('save') || "Ученик подтвержден");
        } catch (err) {
            console.error(err);
            alert("Ошибка подтверждения");
        }
    };

    if (!user?.assigned_classes?.length || !user?.assigned_subjects?.length) {
        return <TeacherRestriction />;
    }

    return (
        <div style={{ padding: '20px' }}>



            {view === 'approval' && (
                <div className="section-container animate-fade-in" style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Users size={20} color="var(--accent-yellow)" />
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Подтверждение учеников</h3>
                    </div>

                    {pendingStudents.length === 0 ? (
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                            <Zap size={40} style={{ opacity: 0.1, marginBottom: '15px' }} />
                            <p>Новых заявок на вступление в ваши классы нет</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pendingStudents.map(s => (
                                <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', border: '1px solid rgba(255,236,139,0.2)' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{s.full_name}</h4>
                                        <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#888' }}>
                                            Класс: <strong style={{ color: 'var(--accent-yellow)' }}>{s.class_name}</strong> • {s.username}
                                        </p>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={() => handleApproveStudent(s.id)}>
                                        <Check size={16} style={{ marginRight: '5px' }} /> Подтвердить
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                <div className="view-switcher pro-switcher">
                    <button className={view === 'lessons' ? 'active' : ''} onClick={() => handleViewChange('lessons')}>{t('nav_lessons')}</button>
                    <button className={view === 'journal' ? 'active' : ''} onClick={() => handleViewChange('journal')}>{t('journal')}</button>
                    <button className={view === 'hw' ? 'active' : ''} onClick={() => handleViewChange('hw')}>{t('homework_full_title')}</button>
                    <button className={view === 'approval' ? 'active' : ''} onClick={() => handleViewChange('approval')} style={{ position: 'relative' }}>
                        Заявки
                        {pendingStudents.length > 0 && (
                            <span style={{ 
                                position: 'absolute', top: '-5px', right: '-5px', 
                                background: '#ff4d4d', color: 'white', fontSize: '10px', 
                                padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' 
                            }}>{pendingStudents.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {view === 'lessons' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>
                        <button 
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '15px' }}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={20} /> <span style={{ fontWeight: 'bold' }}>{t('start_lesson_btn') || 'Новый урок'}</span>
                        </button>
                    </div>

                    {/* Active Lesson Prompt */}
                    {lessons.find(l => !l.finished_at) && (
                        <div className="card animate-fade-in active-lesson-banner" 
                            onClick={() => {
                                const active = lessons.find(l => !l.finished_at);
                                if (active) fetchLessonDetail(active.lesson_id_str);
                            }}
                            style={{ 
                                background: 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)', 
                                color: 'white', 
                                padding: '20px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="pulse-container" style={{ position: 'relative' }}>
                                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-yellow)', borderRadius: '50%' }}></div>
                                    <div className="pulse" style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', background: 'var(--accent-yellow)', borderRadius: '50%', animation: 'pulse-animation 2s infinite' }}></div>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--accent-yellow)' }}>Урок активен</h3>
                                    <p style={{ margin: '5px 0 15px 0', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                        {(lessons.find(l => !l.finished_at) || {topic: lessonTopic}).topic || 'Тема не указана'} • {(lessons.find(l => !l.finished_at) || {class_name: selectedClass}).class_name || 'Все'}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => { e.stopPropagation(); handleOpenQRHistory(lessons.find(l => !l.finished_at) || {lesson_id_str: lessonId, topic: lessonTopic, class_name: selectedClass, subject_id: selectedSubject}); }}>
                                            <ShieldAlert size={16} /> QR
                                        </button>
                                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={(e) => {
                                            e.stopPropagation();
                                            const active = lessons.find(l => !l.finished_at);
                                            if (active) handleFinishLesson(active.lesson_id_str, active.class_name, active.subject_id);
                                            else handleFinishLesson(lessonId, selectedClass, Number(selectedSubject));
                                        }}>
                                            {t('finish_lesson')}
                                        </button>
                                        
                                        <div style={{ position: 'relative' }}>
                                            <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                                                <Lock size={16} /> {t('lock_phones_btn')}
                                            </button>
                                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-yellow)', color: 'black', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                                {t('coming_soon') || 'Скоро'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card animate-fade-in" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <History size={20} color="#666" />
                            <h3 style={{ margin: 0, fontSize: '18px' }}>{t('lesson_history') || 'История уроков'}</h3>
                        </div>

                        {lessons.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                                <Clock size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>{t('no_lessons_yet') || 'Вы еще не проводили уроков'}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                                {(lessons || []).map(l => (
                                    <div 
                                        key={l.id} 
                                        onClick={() => fetchLessonDetail(l.lesson_id_str)}
                                        style={{ 
                                            background: l.finished_at ? '#f8f9fa' : 'rgba(255,193,7,0.05)', 
                                            borderRadius: '15px', 
                                            padding: '15px', 
                                            border: l.finished_at ? '1px solid #eee' : '1px solid var(--accent-yellow)', 
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, background 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => { 
                                            e.currentTarget.style.background = l.finished_at ? '#fff' : 'rgba(255,193,7,0.1)'; 
                                            e.currentTarget.style.transform = 'translateY(-2px)'; 
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; 
                                        }}
                                        onMouseLeave={(e) => { 
                                            e.currentTarget.style.background = l.finished_at ? '#f8f9fa' : 'rgba(255,193,7,0.05)'; 
                                            e.currentTarget.style.transform = 'translateY(0)'; 
                                            e.currentTarget.style.boxShadow = 'none'; 
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'var(--accent-yellow)', padding: '4px 8px', borderRadius: '6px' }}>
                                                    {l.subject_name}
                                                </span>
                                                {!l.finished_at && (
                                                    <span className="live-badge" style={{ fontSize: '10px', color: 'red', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="dot" style={{ width: '6px', height: '6px', background: 'red', borderRadius: '50%', animation: 'pulse-animation 1s infinite' }}></span> LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#999' }}>
                                                {new Date(l.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{l.topic || 'Без темы'}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
                                                    <Users size={14} /> {l.class_name || 'Все'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
                                                    <Sparkles size={14} color="var(--accent-green)" /> {l.attendance_count} чел.
                                                </div>
                                            </div>
                                            
                                            {!l.finished_at && (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenQRHistory(l); }}
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '10px' }}
                                                    >
                                                        QR
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleFinishLesson(l.lesson_id_str, l.class_name, l.subject_id); }}
                                                        className="btn-primary"
                                                        style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '10px' }}
                                                    >
                                                        {t('finish_lesson')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Lesson Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '30px', position: 'relative', textAlign: 'center' }}>
                            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                                <X size={24} />
                            </button>
                        
                        {!showQR ? (
                            <>
                                <h3 style={{ marginBottom: '5px', color: 'var(--text-dark)' }}>{t('start_lesson_title')}</h3>
                                <p style={{ color: 'var(--text-gray)', marginBottom: '25px', fontSize: '14px' }}>
                                    {t('start_lesson_desc')}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', textAlign: 'left' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px', fontWeight: 'bold' }}>ПРЕДМЕТ</label>
                                        <select className="input-field" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px', fontWeight: 'bold' }}>ТЕМА УРОКА</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="Например: Введение в тригонометрию"
                                            value={lessonTopic}
                                            onChange={(e) => setLessonTopic(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px', fontWeight: 'bold' }}>КЛАСС</label>
                                        <select className="input-field" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                            <option value="">Все классы</option>
                                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 0' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={notifyStudents} 
                                            onChange={(e) => setNotifyStudents(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>Оповестить учеников</span>
                                    </label>
                                </div>

                                <button className="btn-primary" style={{ width: '100%', padding: '15px' }} onClick={handleStartLesson} disabled={startingLesson}>
                                    <Zap size={18} /> {startingLesson ? "..." : t('create_lesson_qr')}
                                </button>
                            </>
                        ) : (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>{lessonTopic || 'Урок запущен'}</h3>
                                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                    <QRCodeCanvas value={lessonId} size={220} />
                                </div>

                                <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '12px' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
                                        <Users size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} />
                                        {t('scanned_count')} ({scannedStudents.length}):
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {scannedStudents.map(s => (
                                            <span key={s.id} style={{ background: 'var(--accent-green)', color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '12px' }}>
                                                {s.full_name}
                                            </span>
                                        ))}
                                        {scannedStudents.length === 0 && <span style={{ color: '#999', fontSize: '12px' }}>{t('waiting_students')}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
                                    <button className="btn-primary" style={{ width: '100%', padding: '15px' }} 
                                        onClick={() => { setShowQR(false); setShowCreateModal(false); }}
                                    >
                                        {t('hide_qr') || 'Скрыть QR'}
                                    </button>

                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <button className="btn-secondary" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.05)', color: '#888', border: '1px dashed #ccc', cursor: 'default' }}>
                                            <Lock size={16} /> {t('lock_phones_btn')}
                                        </button>
                                        <span style={{ position: 'absolute', top: '-8px', right: '10px', background: 'var(--accent-yellow)', color: 'black', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                                            {t('coming_soon') || 'Скоро'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lesson Detail Modal */}
            {selectedLessonDetail && (
                <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '30px', position: 'relative' }}>
                        <button onClick={() => setSelectedLessonDetail(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ background: 'var(--accent-yellow)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {selectedLessonDetail.subject_name}
                                </span>
                                <span style={{ fontSize: '14px', color: '#888' }}>•</span>
                                <span style={{ fontSize: '14px', color: '#888', fontWeight: 'bold' }}>{selectedLessonDetail.class_name || 'Все классы'}</span>
                            </div>
                            <h2 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>{selectedLessonDetail.topic || 'Без темы'}</h2>
                            <p style={{ color: '#999', fontSize: '14px' }}>{new Date(selectedLessonDetail.created_at).toLocaleString('ru-RU')}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ flex: 1, background: '#f8f9fa', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>ПРИСУТСТВОВАЛИ</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>{selectedLessonDetail.attendance.filter(a => a.status !== 'absent').length}</p>
                            </div>
                            <div style={{ flex: 1, background: '#f8f9fa', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>ОТСУТСТВОВАЛИ</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4d' }}>{selectedLessonDetail.attendance.filter(a => a.status === 'absent').length}</p>
                            </div>
                        </div>

                        {selectedLessonDetail.homework ? (
                            <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,193,7,0.05)', borderRadius: '15px', border: '1px dashed var(--accent-yellow)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                            <BookOpen size={18} color="var(--accent-yellow)" />
                                            <h4 style={{ margin: 0 }}>{t('attached_hw') || 'Привязанное ДЗ'}</h4>
                                        </div>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{selectedLessonDetail.homework.title}</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{selectedLessonDetail.homework.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setIsAttachingHW(true); setSelectedHWForLesson(selectedLessonDetail.homework.id); }}
                                        style={{ background: 'none', border: 'none', color: '#666', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        {t('change')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '30px' }}>
                                {isAttachingHW ? (
                                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{t('select_hw_label')}</label>
                                        <select 
                                            className="input-field" 
                                            value={selectedHWForLesson} 
                                            onChange={(e) => setSelectedHWForLesson(e.target.value)}
                                            style={{ marginBottom: '15px' }}
                                        >
                                            <option value="">{t('select_lesson') || 'Выберите ДЗ...'}</option>
                                            {(myHomeworks || []).map(h => (
                                                <option key={h.id} value={h.id}>{h.title}</option>
                                            ))}
                                        </select>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setIsAttachingHW(false)}>{t('cancel')}</button>
                                            <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={handleAttachHomework}>{t('attach')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        className="btn-secondary" 
                                        style={{ width: '100%', padding: '15px', borderStyle: 'dashed', borderColor: '#ccc', borderRadius: '15px' }}
                                        onClick={() => setIsAttachingHW(true)}
                                    >
                                        <PlusCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        {t('attach_hw_btn')}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Special case for changing HW when it already exists */}
                        {selectedLessonDetail.homework && isAttachingHW && (
                            <div style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{t('change_hw_label')}</label>
                                <select 
                                    className="input-field" 
                                    value={selectedHWForLesson} 
                                    onChange={(e) => setSelectedHWForLesson(e.target.value)}
                                    style={{ marginBottom: '15px' }}
                                >
                                    <option value="">{t('select_lesson') || 'Выберите ДЗ...'}</option>
                                    {(myHomeworks || []).map(h => (
                                        <option key={h.id} value={h.id}>{h.title}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setIsAttachingHW(false)}>{t('cancel')}</button>
                                    <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={handleAttachHomework}>{t('update')}</button>
                                </div>
                            </div>
                        )}

                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Users size={18} /> Список учеников
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(selectedLessonDetail.attendance || []).sort((a,b) => a.status === 'absent' ? 1 : -1).map(att => (
                                <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f9f9f9', borderRadius: '10px' }}>
                                    <span style={{ fontWeight: '500' }}>{att.user?.full_name || 'Student'}</span>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 'bold', 
                                        padding: '4px 10px', 
                                        borderRadius: '8px',
                                        background: att.status === 'absent' ? 'rgba(255,77,77,0.1)' : 'rgba(76,175,80,0.1)',
                                        color: att.status === 'absent' ? '#ff4d4d' : 'var(--accent-green)'
                                    }}>
                                        {att.status === 'absent' ? 'ОТСУТСТВУЕТ' : 'В КЛАССЕ'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {view === 'hw' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 15px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Filter size={16} color="#666" />
                            <select 
                                value={hwFilterClass} 
                                onChange={(e) => setHwFilterClass(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">{t('all_classes') || 'Все классы'}</option>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Link to="/teacher/create-hw" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <Plus size={20} /> <span style={{ fontWeight: 'bold' }}>{t('create_new_hw') || 'Новое ДЗ'}</span>
                        </Link>
                    </div>

                    <div className="card animate-fade-in" style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>{t('hw_management_title') || 'Мои задания'}</h3>
                        
                        {myHomeworks.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>{t('no_homeworks_yet') || 'Вы еще не создали ни одного задания'}</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                                {(myHomeworks || [])
                                    .filter(h => !hwFilterClass || h.class_name === hwFilterClass)
                                    .map(h => (
                                    <div 
                                        key={h.id} 
                                        onClick={() => fetchHwStats(h.id)}
                                        style={{ 
                                            background: '#f8f9fa', 
                                            borderRadius: '15px', 
                                            padding: '20px', 
                                            position: 'relative', 
                                            border: '1px solid #eee',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#fff';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f8f9fa';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', background: 'var(--accent-green)', color: 'white', padding: '3px 8px', borderRadius: '5px' }}>
                                                {subjects.find(s => s.id === h.subject_id)?.name || 'Subject'}
                                            </span>
                                            {h.is_star && <Zap size={14} color="#ffd700" fill="#ffd700" />}
                                            {h.due_date && (
                                                <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(255,77,77,0.1)', padding: '2px 6px', borderRadius: '6px', color: '#ff4d4d' }}>
                                                    до {new Date(h.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '17px' }}>{h.title}</h4>
                                        <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{h.description}</p>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
                                                    <Users size={14} /> {h.class_name || t('all_classes')}
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); fetchHwStats(h.id); }}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '5px', 
                                                    background: 'rgba(255,193,7,0.1)', 
                                                    color: '#d39e00', 
                                                    border: 'none', 
                                                    padding: '6px 12px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <BarChart3 size={14} /> {t('view_stats') || 'Статистика'}
                                            </button>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteHW(h.id); }}
                                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', opacity: 0.6 }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats Modal / Overlay */}
                    {selectedHwStats && (
                        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '25px', position: 'relative' }}>
                                <button onClick={() => setSelectedHwStats(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                                    <X size={24} />
                                </button>
                                
                                <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>{selectedHwStats.hw_title}</h2>
                                <p style={{ color: '#888', marginBottom: '20px', fontWeight: 'bold' }}>Класс: {selectedHwStats.info ? t('all_classes') : selectedHwStats.class_name}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>✅ {t('completed') || 'Выполнили'} ({selectedHwStats.completed?.length || 0})</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {(selectedHwStats.completed || []).map(s => <span key={s.id} style={{ background: 'rgba(76,175,80,0.1)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{s.full_name}</span>)}
                                            {selectedHwStats.completed?.length === 0 && <span style={{ color: '#999', fontSize: '13px' }}>—</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>⏳ {t('pending') || 'На проверке'} ({selectedHwStats.pending?.length || 0})</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {(selectedHwStats.pending || []).map(s => <span key={s.id} style={{ background: 'rgba(0,0,0,0.05)', color: '#666', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{s.full_name}</span>)}
                                            {selectedHwStats.pending?.length === 0 && <span style={{ color: '#999', fontSize: '13px' }}>—</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>❌ {t('missing') || 'Не приступали'} ({selectedHwStats.missing?.length || 0})</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {(selectedHwStats.missing || []).map(s => <span key={s.id} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{s.full_name}</span>)}
                                            {selectedHwStats.missing?.length === 0 && <span style={{ color: '#999', fontSize: '13px' }}>—</span>}
                                        </div>
                                    </div>
                                    
                                        {selectedHwStats.info && (
                                        <div style={{ padding: '10px', borderRadius: '8px', background: '#f5f5f5', color: '#666', fontSize: '12px', textAlign: 'center' }}>
                                            {selectedHwStats.info === "Global HW (no class filter)" ? t('global_hw_info') : selectedHwStats.info}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card animate-fade-in" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '15px', color: '#333333' }}>{t('review_hw_title')}</h3>
                        {submissions.length === 0 ? (
                            <p style={{ color: '#666666' }}>{t('no_submissions')}</p>
                        ) : (
                            (submissions || []).map(s => (
                                <div key={s.id} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '12px', 
                                    background: '#f9f9f9', 
                                    padding: '15px', 
                                    borderRadius: '16px', 
                                    marginBottom: '15px', 
                                    border: '1px solid #eee',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold', color: '#333333', marginBottom: '2px', fontSize: '15px' }}>{s.student_name}</p>
                                            <p style={{ fontSize: '12px', color: '#666666' }}>{s.hw_title}</p>
                                        </div>
                                    </div>
                                    
                                    {s.attachment_url && (
                                        <a href={s.attachment_url} target="_blank" rel="noreferrer" style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            background: 'rgba(76,175,80,0.1)',
                                            color: '#2e7d32',
                                            borderRadius: '14px',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            border: '2px solid rgba(76,175,80,0.2)',
                                            transition: 'transform 0.2s',
                                            marginBottom: '5px'
                                        }}>
                                            <Sparkles size={18} /> {t('photo_required')}
                                        </a>
                                    )}

                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '12px', 
                                        marginTop: '5px',
                                        paddingTop: '15px',
                                        borderTop: '1px solid #ececec'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Оценка:</span>
                                            <input 
                                                type="number" 
                                                placeholder="5" 
                                                min="1" max="5" 
                                                style={{ 
                                                    flex: 1,
                                                    textAlign: 'center', 
                                                    padding: '5px', 
                                                    border: 'none',
                                                    borderBottom: '2px solid var(--accent-yellow)',
                                                    fontSize: '18px', 
                                                    fontWeight: 'bold',
                                                    background: 'transparent',
                                                    outline: 'none'
                                                }}
                                                value={submissionGrades[s.id] || ''}
                                                onChange={(e) => setSubmissionGrades({...submissionGrades, [s.id]: e.target.value})}
                                            />
                                            <span style={{ fontSize: '12px', color: '#ccc' }}>из 5</span>
                                        </div>
                                        <button 
                                            className="btn-primary" 
                                            style={{ 
                                                width: '100%', 
                                                padding: '14px', 
                                                borderRadius: '14px', 
                                                fontSize: '15px', 
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }} 
                                            onClick={() => handleApproveHW(s.id)}
                                        >
                                            <Zap size={18} /> {t('approve_btn')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}



            {view === 'journal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="card animate-fade-in" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>{t('journal_title')}</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <select className="input-field" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                                {(subjects || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="input-field" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                <option value="">{t('select_class_placeholder')}</option>
                                {(classes || []).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {selectedClass && (
                            <div className="grading-context" style={{ 
                                background: 'rgba(255,193,7,0.05)', 
                                padding: '15px', 
                                borderRadius: '15px', 
                                border: '1px dashed var(--accent-yellow)',
                                marginBottom: '20px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
                                    {t('grading_context')}
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>{t('select_lesson')}</label>
                                        <select 
                                            className="input-field" 
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={gradeLessonId} 
                                            onChange={(e) => {
                                                const lid = e.target.value;
                                                setGradeLessonId(lid);
                                                if (lid) {
                                                    const l = lessons.find(lx => String(lx.id) === lid);
                                                    if (l?.topic) setGradeComment(l.topic);
                                                }
                                            }}
                                        >
                                            <option value="">{t('manual_grading')}</option>
                                            {(lessons || [])
                                                .filter(l => l.subject_id === Number(selectedSubject) && (l.class_name === selectedClass))
                                                .map(l => (
                                                    <option key={l.id} value={l.id}>
                                                        {new Date(l.created_at).toLocaleDateString()} - {l.topic || '(Без темы)'}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>{t('grade_category')}</label>
                                        <select 
                                            className="input-field" 
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={gradeCategory} 
                                            onChange={(e) => setGradeCategory(e.target.value)}
                                        >
                                            <option value="classwork">{t('classwork')}</option>
                                            <option value="homework">{t('homework_category')}</option>
                                            <option value="oral">{t('oral_answer')}</option>
                                            <option value="exam">{t('exam_category')}</option>
                                        </select>
                                    </div>
                                </div>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder={t('grade_comment_placeholder')}
                                    style={{ padding: '8px', fontSize: '13px', border: '1px solid rgba(0,0,0,0.1)' }}
                                    value={gradeComment}
                                    onChange={(e) => setGradeComment(e.target.value)}
                                />
                            </div>
                        )}

                        {!selectedClass ? (
                            <p style={{ color: '#999', textAlign: 'center' }}>Выберите класс для выставления оценок</p>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {classStudents.map(s => {
                                        const isPresent = scannedStudents.some(sc => sc.id === s.id);
                                        return (
                                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '10px 15px', borderRadius: '12px' }}>
                                                <span style={{ fontWeight: '600' }}>{s.full_name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {/* Attendance Indicator */}
                                                    {s.is_assigned ? (
                                                        <>
                                                            <button 
                                                                className="btn-secondary" 
                                                                style={{ 
                                                                    padding: '4px 8px', 
                                                                    fontSize: '11px', 
                                                                    background: isPresent ? 'var(--accent-green)' : '#eee',
                                                                    color: isPresent ? 'white' : '#666',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    cursor: isPresent ? 'default' : 'pointer'
                                                                }}
                                                                onClick={() => !isPresent && handleManualAttendance(s.id)}
                                                            >
                                                                {isPresent ? t('present_badge') : t('mark_present')}
                                                            </button>
                                                            
                                                            <input 
                                                                type="number" 
                                                                placeholder="-" 
                                                                min="1" max="5" 
                                                                style={{ width: '45px', textAlign: 'center', padding: '5px', borderRadius: '8px', border: '1px solid #ccc' }}
                                                                value={studentGrades[s.id] || ''}
                                                                onChange={(e) => setStudentGrades({...studentGrades, [s.id]: e.target.value})}
                                                            />
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: '11px', color: '#999' }}>{t('view_only') || 'Только просмотр'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleSaveGrades} disabled={loading}>
                                    {loading ? t('saving_btn') : t('save_grades_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .tab-btn {
                    flex: 1; padding: 10px; text-align: center; background: #bbb; border-radius: 20px; font-weight: 700; cursor: pointer; color: var(--text-dark);
                }
                .tab-btn.active {
                    background: var(--accent-yellow);
                }
                .add-step-btn:active {
                    transform: scale(0.98);
                    background: rgba(0,0,0,0.05);
                }
                .input-field {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ccc;
                    border-radius: 12px;
                    font-family: inherit;
                    font-size: 16px;
                }
                .circle-btn {
                    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center;
                }
                .view-switcher {
                    display: flex;
                    background: rgba(255,255,255,0.05);
                    padding: 4px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    gap: 4px;
                }
                .view-switcher button {
                    background: transparent;
                    border: none;
                    color: #888;
                    padding: 8px 16px;
                    border-radius: 9px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .view-switcher button.active {
                    background: white;
                    color: black;
                }
                .view-switcher button:hover:not(.active) {
                    background: rgba(255,255,255,0.03);
                    color: white;
                }
                .circle-btn.warn { background-color: #ff4d4d; }
                .circle-btn.praise { background-color: var(--accent-green); }
            `}</style>
        </div>
    );
};

export default TeacherPanel;
