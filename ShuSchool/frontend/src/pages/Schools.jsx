import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, MapPin, Building, Search, X, Shield, Users, UserCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const KAZAKHSTAN_CITIES = [
    "Алматы", "Астана", "Шымкент", "Абай", "Акколь", "Аксай", "Аксу", "Актау", "Актобе", "Алга", "Алтай", "Арал", "Аркалык", "Арыс", "Атбасар", "Атырау", "Аягоз", "Байконур", "Балхаш", "Булаево", "Державинск", "Ерейментау", "Есик", "Есиль", "Жанаозен", "Жанатас", "Жаркент", "Жезказган", "Жем", "Житикара", "Жетисай", "Зайсан", "Зыряновск", "Казалинск", "Кандыагаш", "Капшагай", "Караганда", "Каражал", "Каратау", "Каркаралинск", "Каскелен", "Кентау", "Кокшетау", "Костанай", "Кулсары", "Курчатов", "Кызылорда", "Ленгер", "Лисаковск", "Макинск", "Мамлютка", "Павлодар", "Петропавловск", "Приозёрск", "Риддер", "Рудный", "Сарань", "Сарканд", "Сарыагаш", "Сатпаев", "Семей", "Сергеевка", "Серебрянск", "Степногорск", "Степняк", "Тайынша", "Талдыкорган", "Талгар", "Тараз", "Текели", "Темиртау", "Туркестан", "Уральск", "Усть-Каменогорск", "Ушарал", "Уштобе", "Форт-Шевченко", "Хромтау", "Шар", "Шардара", "Шалкар", "Шемонаиха", "Шу", "Щучинск", "Экибастуз", "Эмба"
];

const Schools = () => {
    const { t } = useLanguage();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSchool, setNewSchool] = useState({ name: '', city: '', address: '' });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [adminModal, setAdminModal] = useState({ isOpen: false, school: null });
    const [schoolAdmins, setSchoolAdmins] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const res = await api.get('/superadmin/schools');
            setSchools(res.data);
        } catch (err) {
            console.error("Failed to fetch schools", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        setError('');
        if (!newSchool.city) {
            setError(t('choose_city_alert'));
            return;
        }
        try {
            await api.post('/superadmin/schools', newSchool);
            setIsModalOpen(false);
            setNewSchool({ name: '', city: '', address: '' });
            fetchSchools();
        } catch (err) {
            setError(err.response?.data?.detail || t('error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('delete_school_confirm_detailed'))) return;
        try {
            await api.delete(`/superadmin/schools/${id}`);
            fetchSchools();
        } catch (err) {
            alert(t('delete_error'));
        }
    };

    const handleOpenAdminModal = async (school) => {
        setAdminModal({ isOpen: true, school });
        fetchSchoolAdmins(school.id);
    };

    const fetchSchoolAdmins = async (schoolId) => {
        try {
            const res = await api.get(`/superadmin/schools/${schoolId}/owners`);
            setSchoolAdmins(res.data);
        } catch (err) {
            console.error("Failed to fetch admins", err);
        }
    };

    const handleUserSearch = async (query) => {
        setUserSearch(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get(`/superadmin/users/search?query=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleAssignAdmin = async (userId) => {
        try {
            await api.post(`/superadmin/schools/${adminModal.school.id}/assign-owner/${userId}`);
            fetchSchoolAdmins(adminModal.school.id);
            setUserSearch('');
            setSearchResults([]);
        } catch (err) {
            alert(t('assign_admin_error'));
        }
    };

    const filteredSchools = schools.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('mgmt_loading')}</p>
        </div>
    );

    return (
        <div className="schools-premium-root">
            <div className="page-header animate-fade-in">
                <div className="header-info">
                    <div className="title-row">
                        <div className="globe-wrap">
                            <Globe size={24} color="var(--accent-yellow)" />
                        </div>
                        <h1 className="premium-title">{t('school_mgmt_title')}</h1>
                    </div>
                    <p className="premium-subtitle">{t('school_mgmt_subtitle')}</p>
                </div>
                
                <button onClick={() => setIsModalOpen(true)} className="premium-add-btn">
                    <Plus size={20} />
                    <span>{t('add_school_btn_detailed')}</span>
                </button>
            </div>

            <div className="search-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="premium-search">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder={t('search_schools_placeholder')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="schools-grid">
                {filteredSchools.length === 0 ? (
                    <div className="premium-empty-state animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="empty-icon-wrap">
                            <Building size={48} />
                        </div>
                        <h3>{searchTerm ? t('no_schools_found') : t('no_schools_in_system')}</h3>
                        <p>{t('start_by_adding_school')}</p>
                        <button onClick={() => setIsModalOpen(true)} className="premium-empty-btn">
                            {t('add_first_school')}
                        </button>
                    </div>
                ) : (
                    filteredSchools.map((school, index) => (
                        <div key={school.id} className="school-card animate-fade-in" style={{ animationDelay: `${0.2 + index * 0.05}s` }}>
                            <div className="card-glass"></div>
                            <div className="school-card-content">
                                <div className="card-top">
                                    <div className="school-main-info">
                                        <div className="school-icon-square">
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <h3 className="school-name">{school.name}</h3>
                                            <div className="school-loc">
                                                <MapPin size={12} />
                                                <span>{school.city || t('city_not_set')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-status-pill">
                                        {t('status_active')}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="info-label">{t('address_col')}:</span>
                                        <span className="info-value">{school.address || '—'}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button onClick={() => handleOpenAdminModal(school)} className="footer-action admin">
                                        <Shield size={18} />
                                        <span>{t('admins_mgmt_label')}</span>
                                    </button>
                                    <button onClick={() => handleDelete(school.id)} className="footer-action delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create School Modal */}
            {isModalOpen && createPortal(
                <div className="premium-modal-overlay">
                    <div className="premium-modal card glass-effect animate-scale-in">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">{t('school_reg_title')}</h3>
                                <p className="modal-subtitle">{t('fill_school_details')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateSchool} className="modal-form">
                            <div className="form-group premium-group">
                                <label>{t('school_name_placeholder')}</label>
                                <div className="input-wrap">
                                    <Building size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        value={newSchool.name} 
                                        onChange={(e) => setNewSchool({...newSchool, name: e.target.value})} 
                                        placeholder={t('school_name_placeholder')}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group premium-group">
                                <label>{t('city_col')}</label>
                                <div className="input-wrap">
                                    <MapPin size={18} className="input-icon" />
                                    <select 
                                        value={newSchool.city} 
                                        onChange={(e) => setNewSchool({...newSchool, city: e.target.value})}
                                        required
                                        className="premium-select"
                                    >
                                        <option value="" disabled>{t('choose_city_alert')}</option>
                                        {KAZAKHSTAN_CITIES.sort().map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group premium-group">
                                <label>{t('exact_address_label')}</label>
                                <div className="input-wrap">
                                    <Globe size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        value={newSchool.address} 
                                        onChange={(e) => setNewSchool({...newSchool, address: e.target.value})} 
                                        placeholder={t('address_placeholder')}
                                    />
                                </div>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="modal-actions">
                                <button type="submit" className="modal-confirm-btn" id="submit-school-btn">{t('create_inst_btn')}</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">{t('cancel')}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Manage Admins Modal */}
            {adminModal.isOpen && createPortal(
                <div className="premium-modal-overlay">
                    <div className="premium-modal card glass-effect admin-modal animate-scale-in">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    <Shield color="var(--accent-yellow)" size={20} />
                                    {t('admins_label').replace('{name}', adminModal.school.name)}
                                </h3>
                                <p className="modal-subtitle">{t('directors_mgmt_desc')}</p>
                            </div>
                            <button onClick={() => setAdminModal({ isOpen: false, school: null })} className="close-btn"><X size={20} /></button>
                        </div>
                        
                        <div className="modal-section">
                            <label className="section-label">{t('current_admins_label')}</label>
                            <div className="premium-admin-list">
                                {schoolAdmins.length === 0 ? (
                                    <div className="no-admins">
                                        <Users size={32} opacity="0.1" />
                                        <p>{t('no_admins_yet')}</p>
                                    </div>
                                ) : (
                                    schoolAdmins.map(admin => (
                                        <div key={admin.id} className="premium-admin-item">
                                            <div className="admin-avatar">{admin.full_name[0]}</div>
                                            <div className="admin-info">
                                                <p className="admin-name">{admin.full_name}</p>
                                                <p className="admin-sub">@{admin.username}</p>
                                            </div>
                                            <span className="premium-admin-badge">DIRECTOR</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="modal-section">
                            <label className="section-label">{t('add_admin_label')}</label>
                            <div className="premium-search inner">
                                <Search size={16} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder={t('user_search_placeholder')} 
                                    value={userSearch}
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="premium-search-results">
                                    {searchResults.map(user => (
                                        <div key={user.id} className="premium-res-item" onClick={() => handleAssignAdmin(user.id)}>
                                            <div className="res-main">
                                                <div className="res-avatar">{user.full_name[0]}</div>
                                                <div className="res-details">
                                                    <p className="res-name">{user.full_name}</p>
                                                    <p className="res-sub">{user.phone}</p>
                                                </div>
                                            </div>
                                            <Plus size={18} color="var(--accent-yellow)" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setAdminModal({ isOpen: false, school: null })} className="modal-cancel-btn" style={{ width: '100%' }}>{t('close_btn')}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style jsx>{`
                .schools-premium-root {
                    padding: 0 5px 40px;
                }

                .page-header {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 30px;
                    padding-top: 10px;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .globe-wrap {
                    background: rgba(255, 236, 139, 0.1);
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 236, 139, 0.2);
                }

                .premium-title {
                    font-size: 24px;
                    margin: 0;
                    color: #fff;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                }

                .premium-subtitle {
                    color: #666;
                    margin: 5px 0 0;
                    font-size: 13px;
                    font-weight: 500;
                }

                .premium-add-btn {
                    background: var(--accent-yellow);
                    color: #000;
                    border: none;
                    padding: 14px;
                    border-radius: 16px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 20px rgba(255, 236, 139, 0.1);
                }
                .premium-add-btn:active { transform: scale(0.95); }

                .search-container {
                    margin-bottom: 25px;
                }

                .premium-search {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 18px;
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: 0.3s;
                }
                .premium-search:focus-within {
                    border-color: var(--accent-yellow);
                    background: rgba(255,255,255,0.05);
                }
                .premium-search input {
                    background: transparent;
                    border: none;
                    color: #fff;
                    width: 100%;
                    outline: none;
                    font-size: 15px;
                    font-family: inherit;
                }
                .search-icon { color: #555; }

                .schools-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .school-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: 0.3s;
                }
                .card-glass {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
                    backdrop-filter: blur(10px);
                    z-index: 1;
                }
                .school-card-content {
                    position: relative;
                    z-index: 2;
                    padding: 20px;
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .school-main-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .school-icon-square {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-yellow);
                }
                .school-name {
                    margin: 0;
                    color: #fff;
                    font-size: 17px;
                    font-weight: 800;
                }
                .school-loc {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #666;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .card-status-pill {
                    background: rgba(74, 222, 128, 0.1);
                    color: #4ade80;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    border: 1px solid rgba(74, 222, 128, 0.2);
                }

                .card-body {
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .info-label {
                    font-size: 10px;
                    color: #555;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .info-value {
                    font-size: 14px;
                    color: #999;
                    font-weight: 500;
                }

                .card-footer {
                    display: flex;
                    gap: 10px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 15px;
                }
                .footer-action {
                    flex: 1;
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #888;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .footer-action:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .footer-action.admin:hover { border-color: var(--accent-yellow); color: var(--accent-yellow); }
                .footer-action.delete { flex: 0 0 50px; }
                .footer-action.delete:hover { color: #f87171; border-color: rgba(248, 113, 113, 0.3); }

                .premium-empty-state {
                    padding: 60px 20px;
                    text-align: center;
                }
                .empty-icon-wrap {
                    width: 80px;
                    height: 80px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: #333;
                }
                .premium-empty-state h3 { color: #fff; font-size: 18px; margin: 0 0 10px; }
                .premium-empty-state p { color: #555; font-size: 14px; margin: 0 0 25px; }
                .premium-empty-btn {
                    background: var(--accent-yellow);
                    color: #000;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 14px;
                    font-weight: 800;
                    cursor: pointer;
                }

                /* Premium Modal Styles */
                .premium-modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                    padding: 20px;
                }
                .premium-modal {
                    width: 100%; max-width: 480px; background: #111; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 32px; padding: 30px;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
                .modal-title { margin: 0; font-size: 20px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;}
                .modal-subtitle { margin: 5px 0 0; font-size: 13px; color: #666; }
                .close-btn { background: none; border: none; color: #444; cursor: pointer; }
                
                .premium-group { margin-bottom: 20px; }
                .premium-group label { display: block; font-size: 10px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
                .input-wrap {
                    background: #080808; border: 1px solid #222; border-radius: 14px;
                    display: flex; align-items: center; gap: 12px; padding: 0 15px; transition: 0.3s;
                }
                .input-wrap:focus-within { border-color: var(--accent-yellow); background: #000; }
                .input-icon { color: #444; }
                .input-wrap input, .premium-select {
                    background: transparent; border: none; color: #fff; padding: 14px 0;
                    width: 100%; outline: none; font-size: 15px; font-family: inherit;
                }
                .premium-select option { background: #111; }

                .modal-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 30px; }
                .modal-confirm-btn { background: var(--accent-yellow); color: #000; padding: 15px; border-radius: 16px; border: none; font-weight: 800; cursor: pointer; }
                .modal-cancel-btn { background: rgba(255,255,255,0.03); color: #666; padding: 15px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; }

                /* Admin Modal Specifics */
                .premium-admin-list { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 10px; min-height: 80px; }
                .no-admins { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; color: #444; font-size: 13px; }
                .premium-admin-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .premium-admin-item:last-child { border: none; }
                .admin-avatar { width: 36px; height: 36px; background: #222; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-yellow); font-weight: 800; font-size: 14px; }
                .admin-name { margin: 0; color: #fff; font-size: 14px; font-weight: 700; }
                .admin-sub { margin: 0; color: #666; font-size: 11px; }
                .premium-admin-badge { margin-left: auto; font-size: 9px; font-weight: 900; color: var(--accent-yellow); background: rgba(255, 236, 139, 0.1); padding: 4px 8px; border-radius: 6px; }

                .premium-search-results { margin-top: 10px; background: #000; border-radius: 16px; padding: 5px; max-height: 200px; overflow-y: auto; }
                .premium-res-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; border-radius: 12px; transition: 0.2s; cursor: pointer; }
                .premium-res-item:hover { background: #111; }
                .res-main { display: flex; align-items: center; gap: 12px; }
                .res-avatar { width: 32px; height: 32px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; }
                .res-name { margin: 0; color: #fff; font-size: 13px; font-weight: 600; }
                .res-sub { margin: 0; color: #555; font-size: 11px; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease forwards; }

                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Schools;
