import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, TrendingUp } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import TeacherRestriction from '../components/TeacherRestriction';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
    const [scope, setScope] = useState('assigned'); // Default to assigned/mine
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeHomeworks: 0,
        avgAttendance: '0%',
        classPerformance: []
    });
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.assigned_classes?.length || !user?.assigned_subjects?.length) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get(`/teacher/stats?scope=${scope}`);
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch teacher stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [scope, user]);

    if (!loading && (!user?.assigned_classes?.length || !user?.assigned_subjects?.length)) {
        return <TeacherRestriction />;
    }

    return (
        <div className="teacher-dashboard animate-fade-in">

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading_analytics')}</div>
            ) : (
                <>
            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="card kpi-card">
                    <Users size={24} color="var(--accent-yellow)" />
                    <div>
                        <h3>{stats.totalStudents}</h3>
                        <p>{t('stats_students')}</p>
                    </div>
                </div>
                <div className="card kpi-card">
                    <BookOpen size={24} color="var(--accent-green)" />
                    <div>
                        <h3>{stats.activeHomeworks}</h3>
                        <p>{t('stats_active_hw')}</p>
                    </div>
                </div>
                <div className="card kpi-card">
                    <Clock size={24} color="#3498db" />
                    <div>
                        <h3>{stats.avgAttendance}</h3>
                        <p>{t('stats_attendance')}</p>
                    </div>
                </div>
                <div className="card kpi-card">
                    <TrendingUp size={24} color="#e74c3c" />
                    <div>
                        <h3>+15%</h3>
                        <p>{t('stats_weekly_growth')}</p>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="card chart-section" style={{ marginTop: '20px', height: '400px', padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>{t('stats_class_performance')}</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={stats.classPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="var(--accent-yellow)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

                </>
            )}

            <style jsx>{`
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 0 10px;
                }
                .kpi-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                }
                .kpi-card h3 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                }
                .kpi-card p {
                    font-size: 14px;
                    color: var(--text-gray);
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
