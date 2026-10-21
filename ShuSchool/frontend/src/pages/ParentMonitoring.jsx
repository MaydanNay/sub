import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import { 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  ShieldCheck, 
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';

const ParentMonitoring = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [activity, setActivity] = useState({ attendance: [], grades: [] });
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/parent/dashboard');
            setChildren(res.data.children || []);
            if (res.data.selected_child) {
                setSelectedChildId(res.data.selected_child.id);
            }
        } catch (err) {
            console.error("Failed to fetch children:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchChildDetails = async (childId) => {
        if (!childId) return;
        try {
            const [activityRes, hwRes] = await Promise.all([
                api.get(`/parent/child/${childId}/activity`),
                api.get(`/homework?child_id=${childId}`)
            ]);
            setActivity(activityRes.data);
            setHomework(hwRes.data);
        } catch (err) {
            console.error("Failed to fetch child details:", err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchChildDetails(selectedChildId);
        }
    }, [selectedChildId]);

    const handleChildChange = (id) => {
        setSelectedChildId(id);
    };

    if (loading && !selectedChildId) {
        return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{t('loading')}</div>;
    }

    return (
        <div className="monitoring-page animate-fade-in">
            {/* Child Switcher */}
            <div className="child-switcher-mobile">
                {children.map(c => (
                    <div 
                        key={c.id} 
                        className={`child-pill ${selectedChildId === c.id ? 'active' : ''}`}
                        onClick={() => handleChildChange(c.id)}
                    >
                        <Avatar user={{ ...c, profile_image: c.avatar }} size={32} />
                        <span>{c.full_name.split(' ')[0]}</span>
                    </div>
                ))}
            </div>

            <div className="monitoring-stack">
                {/* Attendance Summary/Detailed List */}
                <section className="monitoring-card">
                    <div className="card-header">
                        <Calendar size={20} color="var(--parent-accent)" />
                        <h3>{t('attendance_title')}</h3>
                    </div>
                    <div className="activity-list">
                        {activity.attendance.length > 0 ? (
                            activity.attendance.slice(0, 10).map((att) => (
                                <div key={att.id} className="activity-item">
                                    <div className={`status-icon ${att.status}`}>
                                        {att.status === 'on_time' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    </div>
                                    <div className="activity-info">
                                        <p className="activity-title text-white">
                                            {att.type === 'school_entry' ? t('school_entry_label') : t('lesson_label')}
                                        </p>
                                        <p className="activity-date">
                                            {new Date(att.timestamp).toLocaleDateString()} • {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className={`status-badge ${att.status}`}>
                                        {att.status === 'on_time' ? t('on_time_label') : att.status === 'late' ? t('late_label') : t('absent_label')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">{t('no_attendance_msg')}</p>
                        )}
                    </div>
                </section>

                {/* Homework Status */}
                <section className="monitoring-card">
                    <div className="card-header">
                        <BookOpen size={20} color="#ff9f43" />
                        <h3>{t('nav_homework')}</h3>
                    </div>
                    <div className="hw-list">
                        {homework.length > 0 ? (
                            homework.slice(0, 10).map((hw) => (
                                <div key={hw.id} className="hw-item">
                                    <div className="hw-main">
                                        <p className="hw-title text-white">{hw.title}</p>
                                        <p className="hw-subject">ID: {hw.subject_id}</p>
                                    </div>
                                    <div className={`hw-status ${hw.is_completed ? 'completed' : hw.is_pending ? 'pending' : 'todo'}`}>
                                        {hw.is_completed ? t('completed') || 'Выполнено' : hw.is_pending ? t('pending') || 'На проверке' : t('todo') || 'В процессе'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">{t('no_homework_msg') || 'Заданий пока нет'}</p>
                        )}
                    </div>
                </section>

                {/* Recent Grades */}
                <section className="monitoring-card">
                    <div className="card-header">
                        <Award size={20} color="#28c76f" />
                        <h3>{t('grades') || 'Оценки'}</h3>
                    </div>
                    <div className="activity-list">
                        {activity.grades.length > 0 ? (
                            activity.grades.slice(0, 10).map((grade) => (
                                <div key={grade.id} className="activity-item">
                                    <div className="grade-box">
                                        {grade.score}
                                    </div>
                                    <div className="activity-info">
                                        <p className="activity-title text-white">{grade.subject_name}</p>
                                        <p className="activity-date">
                                            {new Date(grade.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="grade-star">
                                        <Star size={16} fill={grade.score >= 5 ? "#ffd700" : "transparent"} color={grade.score >= 5 ? "#ffd700" : "#555"} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">{t('no_grades_msg') || 'Оценок пока нет'}</p>
                        )}
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .monitoring-page {
                    padding: 15px;
                    padding-bottom: 40px;
                }
                .monitoring-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .monitoring-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 28px;
                    padding: 20px;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: white;
                }

                /* Child Switcher */
                .child-switcher-mobile {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding: 5px 5px 20px 5px;
                    scrollbar-width: none;
                }
                .child-switcher-mobile::-webkit-scrollbar { display: none; }
                .child-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.05);
                    padding: 6px 14px 6px 6px;
                    border-radius: 30px;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.6);
                    white-space: nowrap;
                    transition: all 0.3s;
                }
                .child-pill.active {
                    background: var(--parent-accent);
                    border-color: var(--parent-accent);
                    color: white;
                }

                /* Lists */
                .activity-list, .hw-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .activity-item, .hw-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 18px;
                }
                .activity-info, .hw-main {
                    flex: 1;
                }
                .activity-title, .hw-title {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                }
                .activity-date, .hw-subject {
                    margin: 0;
                    font-size: 11px;
                    color: rgba(255,255,255,0.3);
                }
                .text-white { color: white; }

                /* Statuses */
                .status-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .status-icon.on_time { background: rgba(40, 199, 111, 0.1); color: #28c76f; }
                .status-icon.late { background: rgba(255, 159, 67, 0.1); color: #ff9f43; }
                .status-icon.absent { background: rgba(234, 84, 85, 0.1); color: #ea5455; }

                .status-badge {
                    font-size: 10px;
                    font-weight: 900;
                    padding: 4px 8px;
                    border-radius: 8px;
                    text-transform: uppercase;
                }
                .status-badge.on_time { color: #28c76f; border: 1px solid rgba(40, 199, 111, 0.2); }
                .status-badge.late { color: #ff9f43; border: 1px solid rgba(255, 159, 67, 0.2); }
                .status-badge.absent { color: #ea5455; border: 1px solid rgba(234, 84, 85, 0.2); }

                .hw-status {
                    font-size: 11px;
                    font-weight: 800;
                    padding: 6px 12px;
                    border-radius: 12px;
                }
                .hw-status.completed { background: rgba(40, 199, 111, 0.1); color: #28c76f; }
                .hw-status.pending { background: rgba(255, 159, 67, 0.1); color: #ff9f43; }
                .hw-status.todo { background: rgba(255, 255, 255, 0.05); color: rgba(255,255,255,0.5); }

                .grade-box {
                    width: 36px;
                    height: 36px;
                    background: var(--parent-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 18px;
                }

                .empty-state {
                    color: rgba(255,255,255,0.2);
                    text-align: center;
                    font-size: 13px;
                    padding: 20px;
                }
            `}} />
        </div>
    );
};

export default ParentMonitoring;
