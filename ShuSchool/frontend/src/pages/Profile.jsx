import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Award, Coins, Edit2, Check, X, Camera, History, Star, UserCircle, GraduationCap, Zap, Globe } from 'lucide-react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [viewedUser, setViewedUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState('');
    const [editedLastName, setEditedLastName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [parentQuery, setParentQuery] = useState('');
    const [searchingParent, setSearchingParent] = useState(false);

    const isOwnProfile = !userId || (user && parseInt(userId) === user.id);

    useEffect(() => {
        if (userId && (parseInt(userId) !== user?.id)) {
            setLoadingProfile(true);
            api.get(`/users/${userId}`)
                .then(res => setViewedUser(res.data))
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    alert("Не удалось загрузить профиль");
                    navigate(-1);
                })
                .finally(() => setLoadingProfile(false));
        } else {
            setViewedUser(user);
        }
    }, [userId, user]);

    // Sync local state with user data ONLY when not editing
    useEffect(() => {
        if (viewedUser && !isEditing) {
            const nameParts = (viewedUser.full_name || '').split(' ');
            setEditedFirstName(nameParts[0] || '');
            setEditedLastName(nameParts.slice(1).join(' ') || '');
            setEditedPhone(viewedUser.phone_number || '');
        }
    }, [viewedUser, isEditing]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = async () => {
        setSaving(true);
        const fullName = `${editedFirstName} ${editedLastName}`.trim();
        try {
            const response = await api.put('/auth/me', {
                full_name: fullName,
                phone_number: editedPhone
            });
            setUser(response.data);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            const msg = err.response?.data?.detail || t('error');
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        try {
            const response = await api.post('/auth/profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser({ ...user, profile_image: response.data.profile_image });
        } catch (err) {
            console.error("Failed to upload image", err);
            alert(t('error'));
        } finally {
            setSaving(false);
        }
    };

    if (loadingProfile) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>{t('loading') || 'Загрузка...'}</div>;
    if (!viewedUser) return null;

    // Calculate total character progress (average of all 8 stats)
    const renderProgress = () => {
        if (viewedUser.role !== 'student' || !viewedUser.character) return null;

        const char = viewedUser.character;
        const stats = [
            char.economy || 0, char.wisdom || 0, char.influence || 0, char.health || 0,
            char.strength || 0, char.diplomacy || 0, char.technology || 0, char.intellect || 0
        ];
        const avg = Math.round(stats.reduce((a, b) => a + b, 0) / stats.length);

        return (
            <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(0,0,0,0.03)', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dark)' }}>
                        <Zap size={14} fill="var(--accent-yellow)" color="var(--accent-yellow)" /> {t('total_progress')}
                    </div>
                    <span>{avg}%</span>
                </div>
                <div style={{ height: '8px', background: '#ccc', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${avg}%`,
                        background: 'linear-gradient(90deg, var(--accent-green), #22c55e)',
                        transition: 'width 1s ease-out'
                    }}></div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="card animate-fade-in" style={{ padding: '30px', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                {isOwnProfile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                        <Edit2 size={18} />
                    </button>
                )}

                <div
                    onClick={() => isEditing && document.getElementById('avatar-input').click()}
                    style={{
                        margin: '0 auto 20px',
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'inline-block'
                    }}
                >
                    <Avatar
                        user={viewedUser}
                        size={100}
                        style={{ border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                    />
                    {isEditing && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '35%',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            borderBottomLeftRadius: '50px',
                            borderBottomRightRadius: '50px'
                        }}>
                            <Camera size={14} />
                        </div>
                    )}
                </div>
                <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />

                {isEditing ? (
                    <div className="edit-form animate-fade-in">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>{t('first_name')}</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={editedFirstName}
                                    onChange={(e) => setEditedFirstName(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>{t('last_name')}</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={editedLastName}
                                    onChange={(e) => setEditedLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('phone_label')}</label>
                            <input
                                type="text"
                                className="input-field"
                                value={editedPhone}
                                onChange={(e) => setEditedPhone(e.target.value)}
                                placeholder="+7 (___) ___ __ __"
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                                <Check size={18} /> {saving ? '...' : t('save')}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
                                <X size={18} /> {t('cancel')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-dark)', fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>{viewedUser.full_name}</h3>
                        <p style={{ color: '#141414a3', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>@{viewedUser.username}</p>
 
                        {viewedUser.role === 'student' && viewedUser.character && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                <div className="stat-chip level">
                                    Lvl {viewedUser.character.level}
                                </div>
                                <div className="stat-chip">
                                    <Coins size={16} /> {viewedUser.character.coins}
                                </div>
                                <div className="stat-chip star">
                                    <Star size={16} fill="gold" color="gold" /> {viewedUser.character.supercoins}
                                </div>
                            </div>
                        )}
 
                        {renderProgress()}
 
                        {isOwnProfile && !isEditing && viewedUser.role === 'student' && (
                            <button
                                onClick={() => navigate('/student/history')}
                                className="btn-secondary"
                                style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <History size={18} /> {t('earning_history')}
                            </button>
                        )}
                    </div>
                )}


                <div style={{ borderTop: '2px solid rgba(0,0,0,0.05)', paddingTop: '25px', display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-dark)' }}>
                        <div className="icon-box"><UserCircle size={18} /></div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{t('role_label')}</p>
                            <p style={{ fontWeight: '700' }}>
                                {viewedUser.role === 'super_admin' ? t('role_super_admin') :
                                    viewedUser.role === 'admin' ? t('role_admin') :
                                        viewedUser.role === 'teacher' ? t('role_teacher') :
                                            viewedUser.role === 'parent' ? t('role_parent') : t('role_student')}
                            </p>
                        </div>
                    </div>
                    {viewedUser.phone_number && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-dark)' }}>
                            <div className="icon-box"><Mail size={18} /></div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{t('phone_label')}</p>
                                <p style={{ fontWeight: '700' }}>{viewedUser.phone_number}</p>
                            </div>
                        </div>
                    )}
                    {viewedUser.class_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-dark)' }}>
                            <div className="icon-box"><GraduationCap size={18} /></div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{t('class_label')}</p>
                                <p style={{ fontWeight: '700' }}>{viewedUser.class_name}</p>
                            </div>
                        </div>
                    )}
                    {viewedUser.school_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-dark)' }}>
                            <div className="icon-box"><Globe size={18} /></div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{t('school_label') || 'Школа'}</p>
                                <p style={{ fontWeight: '700' }}>{viewedUser.school_name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Parent Linking Section (Student only, own profile only) */}
                {isOwnProfile && viewedUser.role === 'student' && (
                    <div style={{ borderTop: '2px solid rgba(0,0,0,0.05)', marginTop: '25px', paddingTop: '25px', textAlign: 'left' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', marginBottom: '15px' }}>
                            <UserCircle size={20} /> Привязанные родители
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Поиск по телефону или логину"
                                    className="input-field"
                                    value={parentQuery}
                                    onChange={(e) => setParentQuery(e.target.value)}
                                    style={{ flex: 1, marginBottom: 0 }}
                                />
                                <button
                                    className="btn-primary"
                                    style={{ padding: '0 20px', borderRadius: '18px' }}
                                    onClick={async () => {
                                        if (!parentQuery) return;
                                        setSearchingParent(true);
                                        try {
                                            const res = await api.get(`/users/search-parents?query=${parentQuery}`);
                                            setSearchResults(res.data);
                                        } catch (err) {
                                            console.error(err);
                                        } finally {
                                            setSearchingParent(false);
                                        }
                                    }}
                                    disabled={searchingParent}
                                >
                                    {searchingParent ? '...' : 'Найти'}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length === 0 && parentQuery && !searchingParent && (
                                <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '10px' }}>Ничего не найдено</p>
                            )}
                            {searchResults.length > 0 && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.02)',
                                    borderRadius: '15px',
                                    padding: '10px',
                                    marginTop: '10px',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    {searchResults.map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Avatar user={p} size={32} />
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{p.full_name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>@{p.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '11px', padding: '5px 10px' }}
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.post(`/student/request-parent-link?parent_id=${p.id}`);
                                                        if (res.data.status === 'request_sent') {
                                                            alert("Запрос отправлен!");
                                                            setSearchResults([]);
                                                            setParentQuery('');
                                                        } else if (res.data.status === 'already_exists') {
                                                            alert("Вы уже связаны или запрос уже отправлен.");
                                                        }
                                                    } catch (err) { alert("Ошибка при отправке запроса"); }
                                                }}
                                            >
                                                Подключить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>


            {isOwnProfile && (
                <button
                    onClick={handleLogout}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        backgroundColor: '#ff4d4d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginTop: '20px',
                        padding: '15px'
                    }}
                >
                    <LogOut size={20} /> {t('logout_btn')}
                </button>
            )}

            <style jsx>{`
                .badge {
                    background: #eee;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #666;
                }
                .badge.class {
                    background: var(--accent-yellow);
                    color: black;
                }
                .stat-chip {
                    background: rgba(0,0,0,0.05);
                    padding: 6px 14px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 800;
                    font-size: 14px;
                    color: var(--text-dark);
                }
                .stat-chip.level {
                    background: var(--bg-dark);
                    color: white;
                }
                .stat-chip.star {
                    background: rgba(255, 215, 0, 0.15);
                    color: #b8860b;
                }
                .form-group {
                    text-align: left;
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 8px;
                    margin-left: 4px;
                }
                .icon-box {
                    width: 42px;
                    height: 42px;
                    background: rgba(0,0,0,0.04);
                    border-radius: 12px;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #666;
                }
                .edit-form {
                    background: rgba(0,0,0,0.02);
                    padding: 20px;
                    border-radius: 20px;
                    margin-bottom: 30px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
};

export default Profile;
