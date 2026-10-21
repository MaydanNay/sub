import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, UserSearch, Briefcase, GraduationCap, Users, ChevronDown, ChevronUp, Check, Zap } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const AdminStaff = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('teachers'); // teachers, students, parents, admins
    
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [openClassesDropdown, setOpenClassesDropdown] = useState(false);
    const [openSubjectsDropdown, setOpenSubjectsDropdown] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [allAvailableClasses, setAllAvailableClasses] = useState([]);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [usersResp, pendingResp, subsResp, classesResp] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/pending-staff'),
                api.get('/subjects'),
                api.get('/admin/classes')
            ]);
            setUsers(usersResp.data);
            setPendingUsers(pendingResp.data);
            setAllSubjects(subsResp.data);
            setAllAvailableClasses(classesResp.data.map(c => c.name).sort());
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/approve`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Error approving user");
        }
    };

    const handleUpdateResponsibilities = async () => {
        if (!selectedTeacher) return;
        try {
            await api.patch(`/admin/teachers/${selectedTeacher.id}/responsibilities`, {
                assigned_classes: selectedClasses,
                assigned_subjects: selectedSubjects
            });
            alert(t('save'));
            setSelectedTeacher(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Error updating teacher responsibilities");
        }
    };

    const handleToggleInternshipAccess = async (userId, currentValue) => {
        setTogglingId(userId);
        try {
            await api.post(`/admin/users/${userId}/permissions`, {
                can_create_internships: !currentValue
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Ошибка изменения прав');
        } finally {
            setTogglingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesRole = u.role === (activeTab === 'teachers' ? 'teacher' : activeTab === 'students' ? 'student' : activeTab === 'parents' ? 'parent' : 'admin');
        const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                              u.username.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
    });

    if (loading && users.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}...</div>;

    return (
        <div className="admin-staff animate-fade-in">
            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
                <div className="section-container">
                    <h3 className="section-title">{t('pending_registrations')} ({pendingUsers.length})</h3>
                    <div className="approval-scroll">
                        {pendingUsers.map(u => (
                            <div key={u.id} className="card approval-card-large">
                                <div className="user-info">
                                    <h4 style={{ margin: 0 }}>{u.full_name}</h4>
                                    <p style={{ margin: '2px 0', fontSize: '12px', color: '#888' }}>
                                        {u.username} • {u.role} {u.class_name ? `• ${u.class_name}` : ''}
                                    </p>
                                </div>
                                <div className="actions">
                                    <button className="btn-approve" onClick={() => handleApprove(u.id)}>
                                        <UserCheck size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Directory */}
            <div className="directory-container">
                <div className="directory-header">
                    <h3 className="section-title">{t('user_directory')}</h3>
                    <div className="search-bar">
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder={t('search_placeholder')} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="tabs-container">
                    <button className={`tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
                        <Briefcase size={16} /> {t('role_teacher')}
                    </button>
                    <button className={`tab ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
                        <UserCheck size={16} /> Админы (Завучи)
                    </button>
                    <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
                        <GraduationCap size={16} /> {t('role_student')}
                    </button>
                    <button className={`tab ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => setActiveTab('parents')}>
                        <Users size={16} /> {t('role_parent')}
                    </button>
                </div>

                <div className="user-list">
                    {filteredUsers.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                            <UserSearch size={40} style={{ marginBottom: '10px', opacity: 0.3 }} />
                            <p>{t('no_results_found')}</p>
                        </div>
                    ) : (
                        filteredUsers.map(u => (
                            <div key={u.id} className="user-row card">
                                <div className="user-main">
                                    <div className="avatar-circle">
                                        {u.full_name.charAt(0)}
                                    </div>
                                    <div className="user-details">
                                        <h4>{u.full_name}</h4>
                                        {u.role === 'teacher' ? (
                                            <p className="responsible-classes">
                                                {u.assigned_classes && u.assigned_classes.length > 0 
                                                    ? `Классы: ${u.assigned_classes.join(', ')}` 
                                                    : 'Классы не назначены'}
                                            </p>
                                        ) : (
                                            <p>{u.username} {u.class_name ? `• ${u.class_name}` : ''}</p>
                                        )}
                                        {u.can_create_internships && u.role !== 'student' && (
                                            <span style={{ fontSize: '10px', background: 'rgba(255,236,139,0.15)', color: '#FFEC8B', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, display: 'inline-block', marginTop: '3px' }}>
                                                🌟 Мини-Ментор
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {u.role !== 'student' && (
                                        <button
                                            title={u.can_create_internships ? 'Убрать доступ к стажировкам' : 'Дать доступ к стажировкам'}
                                            onClick={() => handleToggleInternshipAccess(u.id, u.can_create_internships)}
                                            disabled={togglingId === u.id}
                                            style={{
                                                background: u.can_create_internships ? 'rgba(255,236,139,0.15)' : 'rgba(255,255,255,0.05)',
                                                border: u.can_create_internships ? '1px solid rgba(255,236,139,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                                color: u.can_create_internships ? '#FFEC8B' : '#555',
                                                width: '32px', height: '32px', borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <Zap size={14} />
                                        </button>
                                    )}
                                    {u.role === 'teacher' && (
                                        <button 
                                            className="btn-edit-classes" 
                                            onClick={() => {
                                                setSelectedTeacher(u);
                                                setSelectedClasses(u.assigned_classes || []);
                                                setSelectedSubjects(u.assigned_subjects || []);
                                                setOpenClassesDropdown(false);
                                                setOpenSubjectsDropdown(false);
                                            }}
                                        >
                                            <Filter size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal for Teacher Assignment */}
            {selectedTeacher && (
                <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Управление учителем</h3>
                        <p style={{ color: '#888', fontSize: '12px' }}>{selectedTeacher.full_name}</p>
                        
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Назначенные классы:</label>
                            <div 
                                className="dropdown-trigger" 
                                onClick={() => setOpenClassesDropdown(!openClassesDropdown)}
                                style={{
                                    marginTop: '8px',
                                    background: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: '13px', color: selectedClasses.length > 0 ? 'white' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px' }}>
                                    {selectedClasses.length > 0 ? selectedClasses.join(', ') : 'Выберите классы...'}
                                </span>
                                {openClassesDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {openClassesDropdown && (
                                <div className="dropdown-content animate-fade-in" style={{
                                    background: '#161616',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    marginTop: '5px',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                    zIndex: 10
                                }}>
                                    {allAvailableClasses.length === 0 ? (
                                        <p style={{ padding: '10px', fontSize: '12px', color: '#666' }}>Классы не найдены</p>
                                    ) : (
                                        allAvailableClasses.map(c => (
                                            <label key={c} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                padding: '10px', 
                                                cursor: 'pointer', 
                                                fontSize: '13px',
                                                background: selectedClasses.includes(c) ? 'rgba(255,236,139,0.05)' : 'transparent',
                                                borderRadius: '8px'
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedClasses.includes(c)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedClasses([...selectedClasses, c]);
                                                        else setSelectedClasses(selectedClasses.filter(cls => cls !== c));
                                                    }}
                                                />
                                                {c}
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Назначенные предметы:</label>
                            <div 
                                className="dropdown-trigger" 
                                onClick={() => setOpenSubjectsDropdown(!openSubjectsDropdown)}
                                style={{
                                    marginTop: '8px',
                                    background: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: '13px', color: selectedSubjects.length > 0 ? 'white' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px' }}>
                                    {selectedSubjects.length > 0 
                                        ? allSubjects.filter(s => selectedSubjects.includes(s.id)).map(s => s.name).join(', ') 
                                        : 'Выберите предметы...'}
                                </span>
                                {openSubjectsDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {openSubjectsDropdown && (
                                <div className="dropdown-content animate-fade-in" style={{
                                    background: '#161616',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    marginTop: '5px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                    zIndex: 10
                                }}>
                                    {allSubjects.map(s => (
                                        <label key={s.id} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px', 
                                            padding: '10px', 
                                            cursor: 'pointer', 
                                            fontSize: '13px',
                                            background: selectedSubjects.includes(s.id) ? 'rgba(255,236,139,0.05)' : 'transparent',
                                            borderRadius: '8px',
                                            color: 'white'
                                        }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSubjects.includes(s.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedSubjects([...selectedSubjects, s.id]);
                                                    else setSelectedSubjects(selectedSubjects.filter(id => id !== s.id));
                                                }}
                                            />
                                            {s.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedTeacher(null)}>{t('cancel')}</button>
                            <button className="btn-primary" onClick={handleUpdateResponsibilities}>{t('save')}</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-staff {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .section-title {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: white;
                }
                .approval-scroll {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .approval-card-large {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #111;
                    border: 1px solid var(--accent-yellow);
                }
                .btn-approve {
                    background: var(--accent-yellow);
                    color: black;
                    border: none;
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .directory-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    gap: 15px;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #1a1a1a;
                    padding: 8px 12px;
                    border-radius: 12px;
                    max-width: 200px;
                    flex: 1;
                }
                .search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 12px;
                    width: 100%;
                    outline: none;
                }
                .tabs-container {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    padding-bottom: 5px;
                }
                .tab {
                    flex: 1;
                    background: #1a1a1a;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: #666;
                    padding: 8px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .tab.active {
                    background: var(--accent-yellow);
                    color: black;
                    border-color: var(--accent-yellow);
                }
                .user-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .user-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #161616;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                }
                .user-main {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #555;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .user-details h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                }
                .user-details p {
                    margin: 0;
                    font-size: 11px;
                    color: #666;
                }
                .responsible-classes {
                    color: var(--accent-yellow) !important;
                    font-weight: 600;
                }
                .btn-secondary {
                    background: #f0f0f0;
                    border: none;
                    color: #111;
                    font-weight: 700;
                }
                .btn-secondary:hover {
                    background: white;
                }
                .btn-edit-classes {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 480px;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                }
                .modal-content {
                    width: 100%;
                    max-width: 400px;
                    margin-top: auto;
                    padding: 25px;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 24px;
                    color: white;
                }
                .modal-content h3 {
                    margin: 0;
                }
                .modal-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 25px;
                }
                .modal-actions button {
                    flex: 1;
                }
                .input-field {
                    width: 100%;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 12px;
                    color: white;
                    font-family: inherit;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default AdminStaff;
