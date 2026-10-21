import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [className, setClassName] = useState('');
    const [schools, setSchools] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    React.useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await api.get('/schools/public');
                setSchools(response.data);
                if (response.data.length > 0) setSchoolId(response.data[0].id);
            } catch (err) {
                console.error("Failed to fetch schools");
            }
        };
        fetchSchools();
    }, []);

    React.useEffect(() => {
        const fetchClasses = async () => {
            if (!schoolId || role !== 'student') {
                setAvailableClasses([]);
                return;
            }
            try {
                const response = await api.get(`/schools/${schoolId}/classes`);
                setAvailableClasses(response.data);
                if (response.data.length > 0) setClassName(response.data[0].name);
                else setClassName('');
            } catch (err) {
                console.error("Failed to fetch classes");
            }
        };
        fetchClasses();
    }, [schoolId, role]);

    const [schoolSearch, setSchoolSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchSchools = async (query) => {
        setSchoolSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await api.get(`/schools/search?q=${query}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({ 
                username, 
                password, 
                full_name: fullName, 
                role,
                school_id: (role === 'student' || role === 'teacher' || role === 'admin') ? parseInt(schoolId) : null,
                class_name: className
            });
            
            if (role === 'teacher' || role === 'admin') {
                alert("Заявка принята! Ожидайте одобрения владельцем школы.");
            } else {
                alert(t('registration_success'));
            }
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || t('registration_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card card">
                <div className="auth-header">
                    <h1>{t('register_title')}</h1>
                    <p style={{ marginBottom: '20px' }}>{t('register_subtitle')}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>{t('username_label')}</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="username"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('full_name_label')}</label>
                        <input 
                            type="text" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            placeholder="Ivan Ivanov"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('role_label')}</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="">{t('choose_role') || 'Выберите роль...'}</option>
                            <option value="student">{t('role_student')}</option>
                            <option value="teacher">{t('role_teacher')}</option>
                            <option value="admin">Администрация (Завуч и т.д.)</option>
                            <option value="parent">{t('role_parent')}</option>
                        </select>
                    </div>

                    {(role === 'student' || role === 'teacher' || role === 'admin') && (
                        <div className="input-group">
                            <label>Поиск школы / университета</label>
                            <input 
                                type="text"
                                value={schoolSearch}
                                onChange={(e) => handleSearchSchools(e.target.value)}
                                placeholder="Введите название..."
                                autoComplete="off"
                            />
                            {searchResults.length > 0 && (
                                <div className="search-results-dropdown">
                                    {searchResults.map(s => (
                                        <div 
                                            key={s.id} 
                                            className={`search-item ${schoolId == s.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSchoolId(s.id);
                                                setSchoolSearch(s.name);
                                                setSearchResults([]);
                                            }}
                                        >
                                            {s.name} ({s.city})
                                        </div>
                                    ))}
                                </div>
                            )}
                            {schoolId && !searchResults.length && (
                                <div className="selected-school-badge">
                                    Выбрано: {schoolSearch}
                                </div>
                            )}
                        </div>
                    )}

                    {role === 'student' && (
                        <div className="input-group">
                            <label>{t('class_label')}</label>
                            {availableClasses.length > 0 ? (
                                <select 
                                    value={className} 
                                    onChange={(e) => setClassName(e.target.value)} 
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #ccc' }}
                                >
                                    {availableClasses.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div style={{ 
                                    padding: '12px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    color: '#888', 
                                    fontSize: '13px', 
                                    borderRadius: '12px',
                                    border: '2px solid #333'
                                }}>
                                    Классы еще не созданы администратором этой школы
                                </div>
                            )}
                        </div>
                    )}
                    <div className="input-group">
                        <label>{t('password_label')}</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    {error && <p className="error-msg">{error}</p>}
                    
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0' }} disabled={loading}>
                        <UserPlus size={20} /> {t('register_link')}
                    </button>
                </form>
                
                <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p>{t('already_have_account')} <Link to="/login" style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{t('login_link')}</Link></p>
                    <p>{t('staff_login_hint')} <Link to="/staff" style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{t('staff_login_link')}</Link></p>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    max-width: 480px;
                    margin: 0 auto;
                    padding: 20px;
                    background: var(--bg-dark);
                    position: relative;
                }
                .auth-card {
                    width: 100%;
                    max-width: 400px;
                    padding: 40px;
                    text-align: center;
                }
                .auth-header h1 {
                    margin-top: 0;
                    font-size: 24px;
                    color: var(--text-dark);
                }
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .input-group {
                    text-align: left;
                }
                .input-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: bold;
                    color: var(--text-dark);
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                .input-group input, .input-group select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ccc;
                    border-radius: 12px;
                    background: white;
                    font-family: inherit;
                    color: var(--text-dark);
                }
                .auth-btn {
                    width: 100%;
                    margin-top: 10px;
                }
                .error-msg {
                    color: #ff4d4d;
                    font-size: 14px;
                }
                .search-results-dropdown {
                    background: white;
                    border: 2px solid #ccc;
                    border-radius: 12px;
                    margin-top: 5px;
                    max-height: 200px;
                    overflow-y: auto;
                    width: 100%;
                }
                .search-item {
                    padding: 10px 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    color: var(--text-dark);
                    font-size: 14px;
                }
                .search-item:hover {
                    background: #f0f0f0;
                }
                .search-item.active {
                    background: var(--accent-yellow);
                    color: white;
                }
                .selected-school-badge {
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #e8f5e9;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #2e7d32;
                    font-weight: bold;
                }
                .auth-footer {
                    margin-top: 10px;
                    font-size: 14px;
                }
                .auth-footer a {
                    color: var(--accent-yellow);
                    font-weight: bold;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
