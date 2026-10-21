import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, User, Mail, Shield, ShieldAlert, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all'
    const { t } = useLanguage();

    const [linkModal, setLinkModal] = useState({ show: false, parentId: null, parentName: '' });
    const [selectedStudentId, setSelectedStudentId] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const pendingRes = await api.get('/admin/users/pending');
            setPendingUsers(pendingRes.data);
            
            const allRes = await api.get('/admin/users');
            setAllUsers(allRes.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/users/${id}/approve`);
            fetchUsers();
        } catch (err) {
            console.error("Approval failed", err);
            alert(t('error'));
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm(t('confirm_delete_app'))) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error("Rejection failed", err);
            alert(t('error'));
        }
    };

    const handleBlock = async (id) => {
        if (!window.confirm(t('confirm_block_user'))) return;
        try {
            await api.post(`/admin/users/${id}/soft-delete`);
            fetchUsers();
        } catch (err) {
            console.error("Block failed", err);
            alert(t('error'));
        }
    };

    const handlePromote = async (id) => {
        if (!window.confirm(t('confirm_make_admin'))) return;
        try {
            await api.post(`/admin/users/${id}/promote`);
            alert(t('success_admin_rights'));
            fetchUsers();
        } catch (err) {
            console.error("Promotion failed", err);
            alert(t('error'));
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.post(`/admin/users/${id}/restore`);
            fetchUsers();
        } catch (err) {
            console.error("Restore failed", err);
            alert(t('error'));
        }
    };

    const handleLinkParent = async () => {
        if (!selectedStudentId) return;
        try {
            await api.post(`/admin/link-parent?parent_id=${linkModal.parentId}&student_id=${selectedStudentId}`);
            alert(t('save'));
            setLinkModal({ show: false, parentId: null, parentName: '' });
            setSelectedStudentId('');
            fetchUsers();
        } catch (err) {
            console.error("Linking failed", err);
            alert(t('error'));
        }
    };

    const UserCard = ({ user, type }) => (
        <div className="card user-premium-card" style={{ 
            opacity: user.deleted_at ? 0.6 : 1,
            animationDelay: '0.2s'
        }}>
            <div className="card-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    <div className="avatar-wrap">
                        <Avatar user={user} size={48} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 className="user-name">{user.full_name}</h4>
                        <p className="user-handle">@{user.username}</p>
                        <div className="badge-row">
                            <span className={`premium-role ${user.role}`}>{user.role.toUpperCase()}</span>
                            {user.class_name && <span className="premium-class">{user.class_name}</span>}
                            {!user.is_approved && !user.deleted_at && <span className="premium-status pending">{t('status_waiting')}</span>}
                            {user.deleted_at && <span className="premium-status blocked">{t('status_blocked')}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="action-row">
                    {user.deleted_at ? (
                        <button onClick={() => handleRestore(user.id)} className="premium-action-btn restore" title={t('restore')}><ShieldCheck size={18} /></button>
                    ) : type === 'pending' ? (
                        <>
                            <button onClick={() => handleApprove(user.id)} className="premium-action-btn approve" title={t('approve')}><CheckCircle size={18} /></button>
                            <button onClick={() => handleReject(user.id)} className="premium-action-btn reject" title={t('reject')}><XCircle size={18} /></button>
                        </>
                    ) : (
                        <button onClick={() => handleBlock(user.id)} className="premium-action-btn block" title={t('block')}><ShieldAlert size={18} /></button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .user-premium-card {
                    background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 16px;
                    margin-bottom: 12px;
                    animation: fadeInUp 0.5s ease both;
                }
                .card-inner { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .avatar-wrap { padding: 2px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; }
                .user-name { color: #fff; margin: 0; font-size: 16px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .user-handle { color: #666; font-size: 12px; margin: 2px 0; font-weight: 500; }
                
                .badge-row { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
                .premium-role { font-size: 8px; padding: 2px 6px; border-radius: 6px; font-weight: 900; letter-spacing: 0.5px; }
                .premium-role.teacher { background: rgba(52, 152, 219, 0.1); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.2); }
                .premium-role.student { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
                .premium-role.admin { background: rgba(243, 156, 18, 0.1); color: #f39c12; border: 1px solid rgba(243, 156, 18, 0.2); }
                
                .premium-class { font-size: 8px; padding: 2px 6px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #888; font-weight: 800; border: 1px solid rgba(255,255,255,0.05); }
                .premium-status { font-size: 8px; padding: 2px 6px; border-radius: 6px; font-weight: 900; }
                .premium-status.pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
                .premium-status.blocked { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }
                
                .action-row { display: flex; gap: 8px; }
                .premium-action-btn { 
                    border: none; width: 36px; height: 36px; border-radius: 12px; cursor: pointer; 
                    display: flex; align-items: center; justify-content: center; transition: 0.3s;
                    background: rgba(255,255,255,0.03); color: #555; border: 1px solid rgba(255,255,255,0.05);
                }
                .premium-action-btn:hover { transform: scale(1.1); color: #fff; background: rgba(255,255,255,0.08); }
                .premium-action-btn.approve:hover { color: #2ecc71; border-color: rgba(46,204,113,0.3); }
                .premium-action-btn.reject:hover { color: #e74c3c; border-color: rgba(231,76,60,0.3); }
                .premium-action-btn.restore:hover { color: #3498db; border-color: rgba(52,152,219,0.3); }
            `}</style>
        </div>
    );


    if (loading) return (
        <div style={{ padding: '100px 40px', textAlign: 'center', color: 'var(--accent-yellow)', fontSize: '18px', fontWeight: '800' }}>
            {t('loading_data')}
        </div>
    );

    return (
        <div style={{ padding: '0 5px' }}>
            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div className="premium-stat-box" style={{ borderLeft: '4px solid #e74c3c' }}>
                    <h3>{pendingUsers.length}</h3>
                    <p>{t('new_applications')}</p>
                </div>
                <div className="premium-stat-box" style={{ borderLeft: '4px solid #3498db' }}>
                    <h3>{allUsers.length}</h3>
                    <p>{t('all_users')}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="premium-tabs">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={activeTab === 'pending' ? 'active' : ''}
                >
                    {t('new_applications')} <span>{pendingUsers.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('all')}
                    className={activeTab === 'all' ? 'active' : ''}
                >
                    {t('all_users')}
                </button>
            </div>

            {/* User List */}
            <div className="user-list-container">
                {activeTab === 'pending' ? (
                    pendingUsers.length === 0 ? (
                        <div className="empty-state animate-fade-in">
                            <CheckCircle size={48} className="empty-icon" />
                            <p>{t('all_done')}</p>
                        </div>
                    ) : (
                        pendingUsers.map(user => <UserCard key={user.id} user={user} type="pending" />)
                    )
                ) : (
                    allUsers.map(user => <UserCard key={user.id} user={user} type="all" />)
                )}
            </div>

            {/* Link Modal */}
            {linkModal.show && (
                <div className="modal-overlay">
                    <div className="premium-modal card glass-effect">
                        <h3 className="modal-title">{t('action_link_child')} @ {linkModal.parentName}</h3>
                        
                        <div className="form-group">
                            <select 
                                value={selectedStudentId} 
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="premium-select"
                            >
                                <option value="">{t('choose_student')}...</option>
                                {allUsers
                                    .filter(u => u.role === 'student' && !u.deleted_at)
                                    .map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.full_name} (@{student.username})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
                            <button onClick={handleLinkParent} className="premium-modal-btn confirm" disabled={!selectedStudentId}>
                                {t('confirm')}
                            </button>
                            <button onClick={() => setLinkModal({ show: false, parentId: null, parentName: '' })} className="premium-modal-btn cancel">
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .premium-stat-box {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                    animation: fadeInUp 0.5s ease both;
                }
                .premium-stat-box h3 { font-size: 28px; margin: 0; color: #fff; font-weight: 800; }
                .premium-stat-box p { font-size: 12px; margin: 4px 0 0; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

                .premium-tabs {
                    display: flex;
                    background: rgba(255,255,255,0.03);
                    padding: 4px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .premium-tabs button {
                    flex: 1; padding: 12px; border: none; background: transparent; color: #555;
                    font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.3s;
                    border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .premium-tabs button span { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; font-size: 10px; }
                .premium-tabs button.active { background: var(--accent-yellow); color: #000; box-shadow: 0 5px 15px rgba(255,215,0,0.2); }
                .premium-tabs button.active span { background: rgba(0,0,0,0.1); }

                .empty-state { padding: 60px 20px; text-align: center; color: #444; }
                .empty-icon { opacity: 0.1; color: var(--accent-yellow); margin-bottom: 15px; }
                .empty-state p { font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-size: 14px; }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                    padding: 20px;
                }
                .premium-modal {
                    width: 100%; max-width: 400px; padding: 30px; border-radius: 30px;
                    background: #111; border: 1px solid rgba(255,255,255,0.1);
                    animation: fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                .modal-title { margin: 0 0 20px; color: #fff; font-size: 20px; font-weight: 800; }
                .premium-select {
                    width: 100%; background: #000; border: 1px solid #333; color: #fff;
                    padding: 14px; border-radius: 12px; font-size: 15px; outline: none;
                }
                .premium-modal-btn {
                    flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s;
                }
                .premium-modal-btn.confirm { background: var(--accent-yellow); color: #000; }
                .premium-modal-btn.confirm:disabled { opacity: 0.5; cursor: not-allowed; }
                .premium-modal-btn.cancel { background: #222; color: #888; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
