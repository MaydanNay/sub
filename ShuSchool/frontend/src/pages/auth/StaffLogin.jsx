import React, { useState } from 'react';
import { useAuth, getDashboardPath } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api';

const StaffLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(username, password);
            navigate(getDashboardPath(user.role));
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (detail === "Incorrect username, phone, or password") {
                setError(t('login_error_user'));
            } else if (detail === "Incorrect password") {
                setError(t('login_error_password'));
            } else {
                setError(t('login_error'));
            }
        }
    };

    return (
        <div className="staff-auth-container animate-fade-in">
            <div className="card staff-auth-card">
                <div className="staff-auth-header">
                    <div className="icon-circle" style={{ overflow: 'hidden', padding: 0 }}>
                        <img src="/logo.jpg" alt="ShuSchool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1>{t('staff_portal')}</h1>
                    <p>{t('welcome_sub')}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="staff-auth-form">
                    <div className="form-group">
                        <label>{t('username_or_phone')}</label>
                        <input 
                            type="text" 
                            className="input-field"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('password_label')}</label>
                        <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="input-field"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                style={{ width: '100%', paddingRight: '45px' }}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="staff-error-msg">{error}</p>}
                    
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        {t('enter_cabinet')} <LogIn size={18} />
                    </button>
                </form>
                
                <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-gray)' }}>
                        {t('no_account')} <Link to="/register" style={{ color: 'black', fontWeight: 'bold', textDecoration: 'none' }}>{t('register_link')}</Link>
                    </p>
                    <Link to="/login" className="student-link">{t('student_link')}</Link>
                </div>
            </div>

            <style jsx>{`
                .staff-auth-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    max-width: 480px;
                    margin: 0 auto;
                    background: var(--bg-dark);
                    padding: 20px;
                    position: relative;
                }
                .staff-auth-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 40px 30px;
                    text-align: center;
                }
                .staff-auth-header {
                    margin-bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .icon-circle {
                    width: 70px;
                    height: 70px;
                    background: var(--accent-yellow);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 20px rgba(255, 236, 139, 0.3);
                }
                .staff-auth-header h1 {
                    margin: 0;
                    font-size: 28px;
                    color: var(--text-dark);
                }
                .staff-auth-header p {
                    color: var(--text-gray);
                    font-size: 15px;
                    margin-top: 5px;
                }
                
                .staff-auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-group {
                    text-align: left;
                }
                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-dark);
                    margin-bottom: 8px;
                    margin-left: 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .staff-error-msg {
                    color: #e74c3c;
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0;
                    background: rgba(231, 76, 60, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                }
                
                .footer-links {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .student-link {
                    color: var(--text-gray);
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .student-link:hover {
                    color: var(--text-dark);
                }
            `}</style>
        </div>
    );
};

export default StaffLogin;
