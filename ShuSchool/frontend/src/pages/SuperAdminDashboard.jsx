import React, { useState, useEffect } from 'react';
import { Crown, Shield, UserPlus, Trash2, Globe, Heart, Zap, Box, UserCheck } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import { useLanguage } from '../context/LanguageContext';

const SuperAdminDashboard = () => {
    const { t } = useLanguage();
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({ schools: 0, active_users: 0, admins: 0, nps: 0 });
    const [loading, setLoading] = useState(true);
    
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', full_name: '', phone_number: '', password: '' });
    
    const [schools, setSchools] = useState([]);
    const [showSchoolForm, setShowSchoolForm] = useState(false);
    const [newSchool, setNewSchool] = useState({ name: '', city: '', address: '' });
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [view, setView] = useState('schools'); // schools, admins

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [adminsRes, statsRes, schoolsRes] = await Promise.all([
                api.get('/superadmin/admins'),
                api.get('/superadmin/stats'),
                api.get('/superadmin/schools')
            ]);
            setAdmins(adminsRes.data);
            setStats(statsRes.data);
            setSchools(schoolsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (userId) => {
        try {
            await api.post(`/superadmin/promote-sa/${userId}`);
            fetchData();
        } catch (err) {
            alert(t('error'));
        }
    };

    const handleCreateSchool = async () => {
        if (!newSchool.name) return alert("Введите название школы");
        try {
            await api.post('/superadmin/schools', newSchool);
            setNewSchool({ name: '', city: '', address: '' });
            setShowSchoolForm(false);
            fetchData();
        } catch (err) {
            alert("Ошибка создания школы");
        }
    };

    const handleAssignOwner = async (schoolId, ownerId) => {
        try {
            await api.post(`/superadmin/schools/${schoolId}/assign-owner/${ownerId}`);
            alert("Владелец назначен");
            setSelectedSchool(null);
            fetchData();
        } catch (err) {
            alert("Ошибка назначения владельца");
        }
    };

    const handleCreateAdmin = async () => {
        if (!newAdmin.username || !newAdmin.password || !newAdmin.full_name) {
            alert(t('fill_fields_alert'));
            return;
        }
        try {
            await api.post('/superadmin/admins', newAdmin);
            setNewAdmin({ username: '', full_name: '', phone_number: '', password: '' });
            setShowAdminForm(false);
            fetchData();
        } catch (err) {
            alert(t('error') + ": " + (err.response?.data?.detail || "unknown error"));
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(t('block_user_confirm').replace('{name}', user.full_name))) return;
        try {
            await api.post(`/admin/users/${user.id}/soft-delete`);
            fetchData();
        } catch (err) {
            alert(t('error'));
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div className="stat-card" style={{ 
            animationDelay: `${delay}s`,
            background: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: `0 10px 30px -10px ${color}33`
        }}>
            <div className="stat-icon" style={{ 
                background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                boxShadow: `0 4px 15px ${color}44`
            }}>
                <Icon size={20} color="white" />
            </div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
            <style jsx>{`
                .stat-card {
                    padding: 16px; border-radius: 20px; display: flex; align-items: center; gap: 12px;
                    backdrop-filter: blur(10px);
                    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
                    transition: transform 0.3s ease;
                }
                .stat-card:hover { transform: translateY(-5px); }
                .stat-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-info h3 { font-size: 20px; margin: 0; color: white; font-weight: 800; }
                .stat-info p { font-size: 11px; margin: 0; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
            `}</style>
        </div>
    );

    if (loading) return <div style={{ color: 'var(--accent-yellow)', textAlign: 'center', padding: '100px', fontSize: '18px', fontWeight: 'bold' }}>{t('global_data_loading')}</div>;

    return (
        <div className="super-admin-view">
            {/* Global Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                <StatCard icon={Globe} label={t('stats_schools')} value={stats.schools} color="#3498db" delay={0.1} />
                <StatCard icon={Zap} label={t('stats_active_users')} value={stats.active_users} color="#f1c40f" delay={0.2} />
                <StatCard icon={Shield} label={t('stats_admins_total')} value={stats.admins} color="#9b59b6" delay={0.3} />
                <StatCard icon={Heart} label={t('stats_nps')} value={stats.nps} color="#e74c3c" delay={0.4} />
            </div>

            {/* Tabs */}
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className={`premium-btn ${view === 'schools' ? 'active' : ''}`} onClick={() => setView('schools')}>
                    <Globe size={18} /> {t('stats_schools')}
                </button>
                <button className={`premium-btn ${view === 'admins' ? 'active' : ''}`} onClick={() => setView('admins')}>
                    <Shield size={18} /> {t('stats_admins_total')}
                </button>
            </div>

            {view === 'schools' && (
                <div className="mgmt-section card glass-effect">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: '800' }}>Управление учебными заведениями</h2>
                            <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0' }}>Создавайте школы и назначайте владельцев</p>
                        </div>
                        <button onClick={() => setShowSchoolForm(!showSchoolForm)} className="premium-btn" style={{ background: 'var(--accent-yellow)', color: 'black' }}>
                            <UserPlus size={18} /> {showSchoolForm ? t('cancel') : 'Добавить заведение'}
                        </button>
                    </div>

                    {showSchoolForm && (
                        <div className="modern-form animate-fade-in">
                            <input className="premium-input" style={{ marginBottom: '10px', paddingLeft: '15px' }} placeholder="Название (напр. Школа №7)" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} />
                            <input className="premium-input" style={{ marginBottom: '10px', paddingLeft: '15px' }} placeholder="Город" value={newSchool.city} onChange={e => setNewSchool({...newSchool, city: e.target.value})} />
                            <input className="premium-input" style={{ marginBottom: '15px', paddingLeft: '15px' }} placeholder="Адрес" value={newSchool.address} onChange={e => setNewSchool({...newSchool, address: e.target.value})} />
                            <button className="premium-btn active" style={{ width: '100%' }} onClick={handleCreateSchool}>Создать</button>
                        </div>
                    )}

                    <div className="admin-table" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {schools.map(school => (
                            <div key={school.id} className="table-row">
                                <div style={{ flex: 2 }}>
                                    <h4 style={{ margin: 0, color: 'white' }}>{school.name}</h4>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{school.city}, {school.address}</p>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <button className="premium-btn active" style={{ fontSize: '12px', padding: '8px 12px' }} onClick={() => setSelectedSchool(school)}>
                                        Назначить владельца
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'admins' && (
                <div className="mgmt-section card glass-effect">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', fontWeight: '800' }}>Глобальные администраторы</h2>
                            <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0' }}>Управление правами системы</p>
                        </div>
                        <button onClick={() => setShowAdminForm(!showAdminForm)} className="premium-btn" style={{ background: 'linear-gradient(90deg, #9b59b6 0%, #8e44ad 100%)' }}>
                            <UserPlus size={18} /> {showAdminForm ? t('cancel') : t('add_owner')}
                        </button>
                    </div>

                    {showAdminForm && (
                        <div className="modern-form animate-fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '15px' }}>
                                <input className="premium-input" style={{ paddingLeft: '15px' }} placeholder={t('fio_placeholder')} value={newAdmin.full_name} onChange={e => setNewAdmin({...newAdmin, full_name: e.target.value})} />
                                <input className="premium-input" style={{ paddingLeft: '15px' }} placeholder={t('login_placeholder')} value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} />
                                <input className="premium-input" style={{ paddingLeft: '15px' }} placeholder={t('phone_label')} value={newAdmin.phone_number} onChange={e => setNewAdmin({...newAdmin, phone_number: e.target.value})} />
                                <input className="premium-input" style={{ paddingLeft: '15px' }} type="password" placeholder={t('password_label')} value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                            </div>
                            <button className="premium-btn active" style={{ width: '100%' }} onClick={handleCreateAdmin}>{t('create_owner_btn')}</button>
                        </div>
                    )}

                    <div className="admin-table">
                        {admins.map(admin => (
                            <div key={admin.id} className="table-row">
                                <div className="admin-profile" style={{ flex: 2 }}>
                                    <div className="avatar-ring" style={{ borderColor: admin.role === 'super_super_admin' ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.1)' }}>
                                        <Avatar user={admin} size={32} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '700' }}>{admin.full_name}</p>
                                        <span style={{ fontSize: '10px', color: '#666' }}>@{admin.username}</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <span className={`premium-badge ${admin.role}`}>
                                        {admin.role.toUpperCase()}
                                    </span>
                                </div>
                                <div className="row-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    {admin.role !== 'super_super_admin' && admin.role !== 'super_admin' && (
                                        <button onClick={() => handlePromote(admin.id)} className="action-icn promote">
                                            <UserCheck size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteUser(admin)} className="action-icn delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Owner Assignment Modal */}
            {selectedSchool && (
                <div className="modal-overlay" onClick={() => setSelectedSchool(null)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Назначить владельца для {selectedSchool.name}</h3>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>Выберите пользователя, который станет владельцем этой школы</p>
                        
                        <div className="admin-table" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                             {admins.filter(a => a.role !== 'super_super_admin').map(user => (
                                 <div key={user.id} className="table-row" onClick={() => handleAssignOwner(selectedSchool.id, user.id)} style={{ cursor: 'pointer' }}>
                                     <div className="admin-profile">
                                         <Avatar user={user} size={24} />
                                         <span style={{ fontSize: '13px' }}>{user.full_name}</span>
                                     </div>
                                 </div>
                             ))}
                        </div>
                        
                        <button className="premium-btn active" style={{ width: '100%', marginTop: '20px' }} onClick={() => setSelectedSchool(null)}>Закрыть</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .super-admin-view { padding: 20px; padding-bottom: 50px; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .glass-effect {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 30px;
                    padding: 25px;
                    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
                }

                .premium-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 12px 20px; border-radius: 16px; border: none;
                    color: white; font-weight: 700; font-size: 14px;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .premium-btn:active { transform: scale(0.95); }
                .premium-btn.active { background: var(--accent-yellow); color: #000; }

                .modern-form { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 25px; }
                
                .premium-input {
                    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);
                    padding: 14px 15px; border-radius: 14px; color: #fff; font-size: 14px; outline: none; transition: 0.3s;
                }
                .premium-input:focus { border-color: var(--accent-yellow); background: rgba(0,0,0,0.5); }

                .table-row { display: flex; padding: 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; transition: 0.2s; }
                .table-row:hover { background: rgba(255,255,255,0.02); }
                
                .admin-profile { display: flex; align-items: center; gap: 12px; }
                .avatar-ring { padding: 2px; border: 2px solid; border-radius: 50%; display: flex; }

                .premium-badge { font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; letter-spacing: 0.5px; }
                .premium-badge.super_super_admin { background: rgba(255, 215, 0, 0.2); color: var(--accent-yellow); border: 1px solid var(--accent-yellow); }
                .premium-badge.super_admin { background: rgba(255, 215, 0, 0.1); color: var(--accent-yellow); border: 1px solid rgba(255,215,0,0.2); }
                .premium-badge.owner { background: rgba(52, 152, 219, 0.1); color: #3498db; border: 1px solid rgba(52,152,219,0.2); }

                .action-icn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 8px; border-radius: 10px; color: #666; cursor: pointer; transition: 0.3s; display: flex; }
                .action-icn:hover { transform: scale(1.1); background: rgba(255,255,255,0.08); color: #fff; }
                .action-icn.delete:hover { color: #e74c3c; border-color: #e74c3c33; }
                .action-icn.promote:hover { color: #2ecc71; border-color: #2ecc7133; }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-content {
                    width: 100%; max-width: 400px; padding: 30px; background: #111;
                    border: 1px solid #333; border-radius: 30px;
                }
            `}</style>
        </div>
    );
};

export default SuperAdminDashboard;
