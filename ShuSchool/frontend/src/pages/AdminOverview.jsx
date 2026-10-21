import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Clock, TrendingUp, CheckCircle2, UserPlus, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResp, pendingResp] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users/pending')
                ]);
                setStats(statsResp.data);
                setPendingUsers(pendingResp.data.slice(0, 3)); // Only show top 3 here
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>{t('loading_analytics')}...</div>;

    const onTimeRate = stats.attendanceToday > 0 
        ? Math.round((stats.onTimeToday / stats.attendanceToday) * 100) 
        : 0;

    return (
        <div className="admin-overview animate-fade-in">
            {/* KPI Section */}
            <div className="kpi-scroll">
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                        <Users size={20} />
                    </div>
                    <div className="kpi-info">
                        <h3>{stats.totalStudents}</h3>
                        <p>{t('total_students')}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="kpi-info">
                        <h3>{stats.attendanceToday}</h3>
                        <p>{t('present_today')}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' }}>
                        <Clock size={20} />
                    </div>
                    <div className="kpi-info">
                        <h3>{onTimeRate}%</h3>
                        <p>{t('on_time_rate')}</p>
                    </div>
                </div>
                <Link to="/admin/users" className="kpi-card" style={{ textDecoration: 'none' }}>
                    <div className="kpi-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>
                        <UserPlus size={20} />
                    </div>
                    <div className="kpi-info">
                        <h3>{stats.pendingCount || 0}</h3>
                        <p>{t('new_applications') || 'Новые заявки'}</p>
                    </div>
                </Link>
            </div>

            {/* Attendance Chart */}
            <div className="card glass-card chart-container">
                <div className="card-header">
                    <h3>{t('attendance_trend')}</h3>
                    <TrendingUp size={16} color="var(--accent-yellow)" />
                </div>
                <div style={{ height: '220px', marginTop: '15px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.attendanceTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', fontSize: '12px' }}
                                itemStyle={{ color: 'var(--accent-yellow)' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="var(--accent-yellow)" strokeWidth={3} dot={{ fill: 'var(--accent-yellow)', r: 4 }} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="overview-section">
                <div className="section-header">
                    <h3>{t('pending_registrations')}</h3>
                    <Link to="/admin/users" className="see-all">
                        {t('see_all')} <ArrowRight size={14} />
                    </Link>
                </div>
                
                {pendingUsers.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle2 size={32} color="#2ecc71" />
                        <p>{t('no_pending_users')}</p>
                    </div>
                ) : (
                    <div className="approval-list">
                        {(pendingUsers || []).map(u => (
                            <div key={u.id} className="approval-item card">
                                <div className="user-avatar-mini">
                                    {u.full_name.charAt(0)}
                                </div>
                                <div className="user-meta">
                                    <h4>{u.full_name}</h4>
                                    <p>
                                        <span className={`role-badge ${u.role}`}>
                                            {u.role === 'teacher' ? t('role_teacher') : u.role === 'admin' ? 'Админ' : t('role_student')}
                                        </span>
                                        {u.class_name && ` • ${u.class_name}`}
                                    </p>
                                </div>
                                <button className="btn-approve-mini" onClick={() => window.location.href='/admin/users'}>
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Performers Grid */}
            <div className="overview-section">
                <div className="section-header">
                    <h3>{t('leaderboard_top')}</h3>
                </div>
                <div className="top-grid">
                    {(stats.topStudents || []).map((s, idx) => (
                        <div key={idx} className="top-student-card card">
                            <span className="rank">{idx + 1}</span>
                            <h4>{s.name}</h4>
                            <div className="coin-badge">
                                🪙 {s.coins}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .admin-overview {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .kpi-scroll {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding-bottom: 5px;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .kpi-scroll::-webkit-scrollbar { display: none; }
                
                .kpi-card {
                    min-width: 140px;
                    flex: 1;
                    background: #1a1a1a;
                    border: 1px solid rgba(225, 225, 225, 0.05);
                    border-radius: 18px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .kpi-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-info h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                    color: white;
                }
                .kpi-info p {
                    margin: 0;
                    font-size: 11px;
                    color: #666;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .chart-container {
                    padding: 20px;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                }
                .overview-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .section-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: #999;
                }
                .see-all {
                    font-size: 12px;
                    color: var(--accent-yellow);
                    text-decoration: none;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .approval-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .approval-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    background: #111;
                }
                .user-avatar-mini {
                    width: 36px;
                    height: 36px;
                    background: var(--accent-yellow);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                    font-weight: 800;
                }
                .user-meta {
                    flex: 1;
                }
                .user-meta h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                }
                .user-meta p {
                    margin: 0;
                    font-size: 12px;
                    color: #666;
                }
                .btn-approve-mini {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .empty-state {
                    padding: 30px;
                    text-align: center;
                    background: rgba(46, 204, 113, 0.05);
                    border: 1px dashed rgba(46, 204, 113, 0.2);
                    border-radius: 18px;
                    color: #2ecc71;
                }
                .empty-state p {
                    margin-top: 10px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .top-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .top-student-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 15px;
                    background: #111;
                }
                .rank {
                    font-weight: 900;
                    color: var(--accent-yellow);
                    font-size: 14px;
                }
                .top-student-card h4 {
                    flex: 1;
                    margin: 0;
                    font-size: 14px;
                }
                .coin-badge {
                    font-size: 12px;
                    font-weight: 800;
                    background: rgba(255, 215, 0, 0.1);
                    padding: 4px 10px;
                    border-radius: 10px;
                    color: var(--accent-yellow);
                }
                .role-badge {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-right: 5px;
                }
                .role-badge.teacher { background: rgba(52, 152, 219, 0.1); color: #3498db; }
                .role-badge.student { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
                .role-badge.admin { background: rgba(243, 156, 18, 0.1); color: #f39c12; }
            `}</style>
        </div>
    );
};

export default AdminOverview;
